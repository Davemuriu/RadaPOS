from flask import Blueprint, request, jsonify, send_file, current_app
from flask_cors import CORS, cross_origin
from flask_jwt_extended import jwt_required
from app.models.transaction import Sale, MpesaPayment
from app.models.product import Product
from app.models.user import User
from app.models.wallet import Wallet, Settlement
from app.extensions import db
from datetime import datetime, timedelta
import requests
import base64
import io
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

mpesa_bp = Blueprint('mpesa_bp', __name__)

# Enable CORS for this entire blueprint
CORS(mpesa_bp)

def get_mpesa_password():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    shortcode = current_app.config.get('MPESA_SHORTCODE')
    passkey = current_app.config.get('MPESA_PASSKEY')
    password_str = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(password_str.encode()).decode('utf-8'), timestamp

def get_access_token():
    consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
    consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
    try:
        r = requests.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", auth=(consumer_key, consumer_secret))
        r.raise_for_status()
        return r.json()['access_token']
    except Exception as e:
        print(f"Token Error: {str(e)}")
        return None

# --- STK PUSH ROUTE ---
@mpesa_bp.route('/pay', methods=['POST'])
@cross_origin() # <--- MUST BE AT THE TOP to handle OPTIONS request
@jwt_required()
def stk_push():
    data = request.get_json()
    try:
        amount = int(float(data.get('amount', 0))) 
        phone_number = data.get('phone_number')
        sale_id = data.get('sale_id') or data.get('sale_id_override')

        if not amount or not phone_number:
            return jsonify({"msg": "Missing amount or phone"}), 400

        token = get_access_token()
        if not token:
            return jsonify({"msg": "M-Pesa Auth Failed"}), 500

        password, timestamp = get_mpesa_password()
        shortcode = current_app.config.get('MPESA_SHORTCODE')
        callback_url = current_app.config.get('MPESA_CALLBACK_URL')

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount, 
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": "RadaPOS",
            "TransactionDesc": "POS Sale"
        }

        headers = { "Authorization": f"Bearer {token}" }

        # Log for debugging
        print(f"Sending STK to {phone_number} for {amount} KES")

        req = requests.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', json=payload, headers=headers)
        res_data = req.json()
        
        if 'ResponseCode' in res_data and res_data['ResponseCode'] == '0':
            new_payment = MpesaPayment(
                sale_id=sale_id, 
                checkout_request_id=res_data['CheckoutRequestID'],
                merchant_request_id=res_data['MerchantRequestID'],
                phone_number=phone_number,
                amount=amount,
                result_desc="Pending"
            )
            db.session.add(new_payment)
            db.session.commit()
            return jsonify({"msg": "Sent", "checkout_request_id": res_data['CheckoutRequestID'], "sale_id": sale_id}), 200
        else:
            print(f"STK Failed: {res_data}")
            return jsonify({"msg": "STK Push Failed", "error": res_data}), 400

    except Exception as e:
        print(f"STK System Error: {e}")
        return jsonify({"msg": "Request failed", "error": str(e)}), 500

@mpesa_bp.route('/callback', methods=['POST'])
@cross_origin()
def callback():
    try:
        data = request.get_json()
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc')
        checkout_id = stk_callback.get('CheckoutRequestID')

        payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_id).first()
        
        if not payment:
            return jsonify({"ResultCode": 0, "ResultDesc": "Ignored"}), 200

        payment.result_code = result_code
        payment.result_desc = result_desc

        if result_code == 0:
            metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            for item in metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    payment.mpesa_receipt_number = item.get('Value')

            if payment.parent_sale:
                sale = payment.parent_sale
                sale.status = 'COMPLETED'
                
                target_vendor_id = None
                if sale.items:
                      prod = Product.query.get(sale.items[0].product_id)
                      if prod: target_vendor_id = prod.vendor_id
                
                if not target_vendor_id:
                      cashier = User.query.get(sale.cashier_id)
                      if cashier: target_vendor_id = cashier.vendor_id if cashier.role != 'VENDOR' else cashier.id

                if target_vendor_id:
                      from app.services.wallet_service import WalletService
                      
                      net_amount = float(sale.total_amount) * 0.90
                      WalletService.add_funds(vendor_id=target_vendor_id, amount=net_amount)
                      
                      wallet = Wallet.query.filter_by(vendor_id=target_vendor_id).first()
                      if wallet:
                          settlement = Settlement(
                             wallet_id=wallet.id,
                             sale_id=sale.id,
                             amount=net_amount,
                             status='completed'
                          )
                          db.session.add(settlement)
        else:
             if payment.parent_sale:
                 payment.parent_sale.status = 'FAILED'

        db.session.commit()
        return jsonify({"ResultCode": 0, "ResultDesc": "Success"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Callback Error: {e}")
        return jsonify({"ResultCode": 1, "ResultDesc": "Internal Error"}), 500

@mpesa_bp.route('/status/<checkout_id>', methods=['GET'])
@cross_origin()
def check_status(checkout_id):
    payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_id).first()
    if not payment: return jsonify({"status": "PENDING"}), 200
    
    if str(payment.result_code) == '0':
        return jsonify({"status": "COMPLETED", "sale_id": payment.sale_id}), 200
    elif payment.result_code is not None:
        return jsonify({"status": "FAILED", "reason": payment.result_desc}), 200
    
    return jsonify({"status": "PENDING"}), 200

@mpesa_bp.route('/receipt/<int:sale_id>', methods=['GET'])
@cross_origin()
def download_receipt(sale_id):
    try:
        sale = Sale.query.get_or_404(sale_id)
        
        vendor = None
        cashier = User.query.get(sale.cashier_id)
        if cashier:
            vendor_id = cashier.id if cashier.role == 'VENDOR' else cashier.vendor_id
            vendor = User.query.get(vendor_id)

        business_name = vendor.business_name.upper() if (vendor and vendor.business_name) else "RADA POS"
        footer_text = getattr(vendor, 'receipt_footer', "Thank you for shopping with us!") or "Thank you for shopping!"
        phone = vendor.phone_number if vendor else ""

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=(300, 750))

        y = 720
        p.setFont("Helvetica-Bold", 14)
        p.drawCentredString(150, y, business_name)
        y -= 20
        p.setFont("Helvetica", 9)
        p.drawCentredString(150, y, "Nairobi, Kenya")
        y -= 15
        if phone:
            p.drawCentredString(150, y, f"Tel: {phone}")
            y -= 20
        
        p.line(20, y, 280, y)
        y -= 20

        p.setFont("Helvetica-Bold", 10)
        p.drawString(20, y, f"RECEIPT #: {sale.id}")
        y -= 15
        p.setFont("Helvetica", 9)
        local_time = sale.created_at + timedelta(hours=3)
        p.drawString(20, y, f"Date: {local_time.strftime('%d/%m/%Y %H:%M')}")
        y -= 15
        p.drawString(20, y, f"Cashier: {sale.cashier.name if sale.cashier else 'N/A'}")
        y -= 25

        p.setFont("Helvetica-Bold", 9)
        p.drawString(20, y, "ITEM")
        p.drawRightString(200, y, "QTY")
        p.drawRightString(280, y, "TOTAL")
        p.line(20, y-5, 280, y-5)
        y -= 20
        
        p.setFont("Helvetica", 9)
        for item in sale.items:
            name = item.product_name[:22] + "..." if len(item.product_name) > 22 else item.product_name
            p.drawString(20, y, name)
            p.drawRightString(200, y, str(item.quantity))
            p.drawRightString(280, y, f"{item.price * item.quantity:,.2f}")
            y -= 15

        y -= 10
        p.line(20, y, 280, y)
        y -= 20

        discount = getattr(sale, 'discount', 0) or 0

        if discount > 0:
            subtotal = sale.total_amount + discount
            
            p.setFont("Helvetica", 9)
            p.drawString(20, y, "Subtotal")
            p.drawRightString(280, y, f"{subtotal:,.2f}")
            y -= 15
            
            p.drawString(20, y, "Discount")
            p.drawRightString(280, y, f"-{discount:,.2f}")
            y -= 15
            
            p.setLineWidth(0.5)
            p.line(180, y+5, 280, y+5) 
            y -= 5

        p.setFont("Helvetica-Bold", 12)
        p.drawString(20, y, "TOTAL")
        p.drawRightString(280, y, f"KES {sale.total_amount:,.2f}")
        
        if sale.payment_method == 'SPLIT':
             y -= 20
             p.setFont("Helvetica", 9)
             p.drawString(20, y, "Paid via Cash:")
             p.drawRightString(280, y, f"{sale.amount_cash:,.2f}")
             y -= 15
             p.drawString(20, y, "Paid via M-Pesa:")
             p.drawRightString(280, y, f"{sale.amount_mpesa:,.2f}")

        landing_page_url = "https://radapos-landing.vercel.app" 
        qr = qrcode.QRCode(box_size=10, border=1)
        qr.add_data(landing_page_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        qr_buf = io.BytesIO()
        qr_img.save(qr_buf, format='PNG')
        qr_buf.seek(0)
        
        y -= 90
        p.drawImage(ImageReader(qr_buf), 110, y, width=80, height=80)

        y -= 20
        p.setFont("Helvetica-Oblique", 8)
        p.drawCentredString(150, y, footer_text)
        
        y -= 12
        p.setFont("Helvetica", 6)
        p.setFillColorRGB(0.5, 0.5, 0.5)
        p.drawCentredString(150, y, "Powered by RadaPOS Enterprise")

        p.showPage()
        p.save()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"Receipt_{sale.id}.pdf", mimetype='application/pdf')
    except Exception as e:
        print(f"Receipt Error: {e}")
        return jsonify({"msg": "Failed to generate receipt"}), 500