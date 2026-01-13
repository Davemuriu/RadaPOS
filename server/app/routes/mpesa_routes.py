import io
import qrcode
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.transaction import Sale, SaleItem, MpesaPayment
from app.models.product import Product
from app.models.user import User
from app.models.wallet import Wallet, Settlement
from app.extensions import db
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.services.daraja_service import MpesaService 
from app.services.wallet_service import WalletService 

mpesa_bp = Blueprint('mpesa_bp', __name__)

@mpesa_bp.route('/pay', methods=['POST'])
@jwt_required()
def initiate_stk_push():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        phone_number = data.get('phone_number')
        amount = data.get('amount')
        cart_items = data.get('items', [])
        
        if not phone_number or not amount:
            return jsonify({"msg": "Phone and Amount required"}), 400

        # 1. CREATE PENDING SALE RECORD
        new_sale = Sale(
            total_amount=amount, 
            payment_method='MPESA', 
            status='PENDING', 
            cashier_id=user_id, 
            created_at=datetime.utcnow()
        )
        db.session.add(new_sale)
        db.session.flush() 

        # Add Items to Sale
        for item in cart_items:
            prod = Product.query.get(item['id'])
            if prod:
                s_item = SaleItem(
                    sale_id=new_sale.id, 
                    product_id=prod.id, 
                    product_name=prod.name, 
                    quantity=item['quantity'], 
                    price=prod.price
                )
                db.session.add(s_item)

        # 2. CALL MPESA SERVICE
        try:
            stk_data = MpesaService.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=f"Sale-{new_sale.id}"
            )
        except Exception as mpesa_error:
            db.session.rollback()
            print(f"❌ STK Push Failed: {str(mpesa_error)}")
            return jsonify({"msg": "M-Pesa Initiation Failed", "error": str(mpesa_error)}), 500

        # 3. SAVE PAYMENT RECORD
        payment = MpesaPayment(
            sale_id=new_sale.id,
            phone_number=phone_number,
            amount=amount,
            checkout_request_id=stk_data['CheckoutRequestID'],
            merchant_request_id=stk_data['MerchantRequestID']
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            "msg": "STK Push Sent", 
            "sale_id": new_sale.id, 
            "checkout_request_id": stk_data['CheckoutRequestID']
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ System Error: {str(e)}")
        return jsonify({"msg": str(e)}), 500

@mpesa_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """
    Safaricom Callback: Reached via Ngrok at /api/mpesa/callback
    """
    try:
        data = request.get_json()
        body = data.get('Body', {}).get('stkCallback', {})
        result_code = body.get('ResultCode')
        checkout_id = body.get('CheckoutRequestID')
        
        payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_id).first()
        if not payment:
            return jsonify({"msg": "Record not found"}), 404

        payment.result_code = result_code
        payment.result_desc = body.get('ResultDesc')
        
        sale = Sale.query.get(payment.sale_id)
        if not sale:
            return jsonify({"msg": "Sale not found"}), 404

        if result_code == 0:
            sale.status = 'COMPLETED'
            
            # Extract Receipt Number
            meta = body.get('CallbackMetadata', {}).get('Item', [])
            receipt_item = next((item for item in meta if item.get('Name') == 'MpesaReceiptNumber'), {})
            payment.mpesa_receipt_number = receipt_item.get('Value', 'N/A')
            
            # 1. Deduct Stock properly
            for item in sale.items:
                prod = Product.query.get(item.product_id)
                if prod:
                    prod.stock_quantity -= item.quantity
            
            # 2. DYNAMIC VENDOR IDENTIFICATION
            # Find the vendor who owns the products in this sale
            target_vendor_id = None
            if sale.items:
                sample_product = Product.query.get(sale.items[0].product_id)
                target_vendor_id = sample_product.vendor_id

            if not target_vendor_id:
                # Fallback to cashier's parent (The Vendor)
                cashier = User.query.get(sale.cashier_id)
                target_vendor_id = cashier.parent_id if cashier and cashier.parent_id else sale.cashier_id

            # 3. WALLET SETTLEMENT (Applying 10% Commission)
            net_amount = float(sale.total_amount) * 0.90
            WalletService.add_funds(vendor_id=target_vendor_id, amount=net_amount)
            
            # Create Settlement Record for Vendor History
            wallet = Wallet.query.filter_by(vendor_id=target_vendor_id).first()
            if wallet:
                new_settlement = Settlement(
                    wallet_id=wallet.id,
                    vendor_id=target_vendor_id,
                    sale_id=sale.id,
                    amount=net_amount,
                    status='completed'
                )
                db.session.add(new_settlement)

            db.session.commit()
            print(f"✅ Sale {sale.id} completed. Vendor {target_vendor_id} credited KES {net_amount}")
        else:
            sale.status = 'FAILED'
            db.session.commit()

        return jsonify({"msg": "Callback processed"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Callback Error: {str(e)}")
        return jsonify({"msg": "Error"}), 500

@mpesa_bp.route('/status/<checkout_id>', methods=['GET'])
def check_status(checkout_id):
    payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_id).first()
    if not payment:
        return jsonify({"status": "PENDING"}), 200
    if payment.result_code == 0:
        return jsonify({"status": "COMPLETED", "receipt": payment.mpesa_receipt_number}), 200
    if payment.result_code is not None:
        return jsonify({"status": "FAILED", "reason": payment.result_desc}), 200
    return jsonify({"status": "PENDING"}), 200

@mpesa_bp.route('/history', methods=['GET'])
@jwt_required()
def get_sale_history():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
        sales = Sale.query.order_by(Sale.created_at.desc()).all()
    elif user.role.upper() == 'VENDOR':
        # Get sales where cashier is the Vendor OR cashier's employer is the Vendor
        sales = Sale.query.join(User, Sale.cashier_id == User.id)\
            .filter((Sale.cashier_id == user_id) | (User.vendor_id == user_id))\
            .order_by(Sale.created_at.desc()).all()
    else:
        # Cashier sees only their own
        sales = Sale.query.filter_by(cashier_id=user_id).order_by(Sale.created_at.desc()).all()
    
    return jsonify([{
        "id": s.id,
        "total_amount": s.total_amount,
        "payment_method": s.payment_method,
        "status": s.status,
        "created_at": (s.created_at + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"),
        "cashier_name": s.cashier.name if s.cashier else "Unknown",
        "items": [{
            "product_name": item.product_name,
            "quantity": item.quantity,
            "price": item.price
        } for item in s.items]
    } for s in sales]), 200

@mpesa_bp.route('/receipt/<int:sale_id>', methods=['GET'])
@jwt_required()
def download_receipt(sale_id):
    try:
        sale = Sale.query.get_or_404(sale_id)
        landing_page_url = "https://radapos-landing.vercel.app" 
        
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=(300, 750))

        # Receipt Header
        p.setFont("Helvetica-Bold", 16)
        p.drawCentredString(150, 720, "RadaPOS")
        p.setFont("Helvetica", 9)
        p.drawCentredString(150, 705, "Nairobi, Kenya | Business Terminal")
        
        p.setDash(1, 2) 
        p.line(20, 690, 280, 690)
        p.setDash([], 0) 

        # Meta Info
        p.setFont("Helvetica-Bold", 10)
        p.drawString(20, 670, f"RECEIPT #: {sale.id}")
        p.setFont("Helvetica", 9)
        local_time = sale.created_at + timedelta(hours=3)
        p.drawString(20, 655, f"Date: {local_time.strftime('%d/%m/%Y %H:%M')}")
        p.drawString(20, 640, f"Cashier: {sale.cashier.name if sale.cashier else 'N/A'}")
        
        # M-Pesa Specific Data
        if sale.payment_method == 'MPESA':
            payment = MpesaPayment.query.filter_by(sale_id=sale.id).first()
            if payment and payment.mpesa_receipt_number:
                p.drawString(20, 625, f"M-PESA REF: {payment.mpesa_receipt_number}")

        p.line(20, 615, 280, 615)

        # Table Header
        p.setFont("Helvetica-Bold", 9)
        p.drawString(20, 600, "ITEM")
        p.drawRightString(200, 600, "QTY")
        p.drawRightString(280, 600, "TOTAL")
        
        # Items Loop
        p.setFont("Helvetica", 9)
        y = 580
        for item in sale.items:
            p.drawString(20, y, item.product_name[:20])
            p.drawRightString(200, y, str(item.quantity))
            p.drawRightString(280, y, f"{item.price * item.quantity:,.2f}")
            y -= 15

        # Footer
        p.line(20, y, 280, y)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(20, y - 20, "TOTAL")
        p.drawRightString(280, y - 20, f"KES {sale.total_amount:,.2f}")

        # QR Code for Verification
        qr = qrcode.QRCode(box_size=10, border=1)
        qr.add_data(landing_page_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buf = io.BytesIO()
        qr_img.save(qr_buf, format='PNG')
        qr_buf.seek(0)
        
        p.drawImage(ImageReader(qr_buf), 110, y - 110, width=80, height=80)
        p.setFont("Helvetica-Bold", 9)
        p.drawCentredString(150, y - 130, "THANK YOU FOR SHOPPING!")
        
        p.showPage()
        p.save()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"Receipt_{sale.id}.pdf", mimetype='application/pdf')
    except Exception as e:
        print(f"Receipt Error: {e}")
        return jsonify({"msg": "Failed to generate receipt"}), 500

@mpesa_bp.route('/sale/<int:sale_id>', methods=['DELETE'])
@jwt_required()
def delete_sale(sale_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role.upper() != 'VENDOR':
        return jsonify({"msg": "Forbidden"}), 403
        
    sale = Sale.query.get_or_404(sale_id)
    db.session.delete(sale)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200