from flask import Blueprint, request, jsonify, Response
from app.models.transaction import Sale, SaleItem, MpesaPayment
from app.models.product import Product
from app.models.user import User
from app.models.notification import Notification
from app.extensions import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.discount import DiscountCode
import csv
import io

transaction_bp = Blueprint('transaction_bp', __name__)

@transaction_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    
    callback_data = data.get('Body', {}).get('stkCallback', {})
    result_code = callback_data.get('ResultCode')
    checkout_id = callback_data.get('CheckoutRequestID')

    payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_id).first()
    
    if not payment:
        return jsonify({"ResultCode": 1, "ResultDesc": "Ignored"}), 200

    if result_code == 0:
        payment.result_code = 0
        payment.result_desc = "Success"
        
        metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
        for item in metadata:
            if item['Name'] == 'MpesaReceiptNumber':
                payment.mpesa_receipt_number = item['Value']

        if payment.parent_sale:
            payment.parent_sale.status = 'COMPLETED'
    else:
        payment.result_code = result_code
        payment.result_desc = callback_data.get('ResultDesc', 'Failed')
        if payment.parent_sale:
            payment.parent_sale.status = 'FAILED'

    db.session.commit()
    return jsonify({"ResultCode": 0, "ResultDesc": "Success"}), 200

@transaction_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            sales = Sale.query.order_by(Sale.created_at.desc()).all()
            
        elif user.role.upper() == 'VENDOR':
            vendor_id = user.id
            sales = Sale.query.join(User, Sale.cashier_id == User.id)\
                .filter((User.id == vendor_id) | (User.vendor_id == vendor_id))\
                .order_by(Sale.created_at.desc()).all()
        else:
            sales = Sale.query.filter_by(cashier_id=current_user_id).order_by(Sale.created_at.desc()).all()
        
        results = []
        for s in sales:
            final_cash = s.amount_cash or 0
            final_mpesa = s.amount_mpesa or 0

            if s.payment_method == 'CASH' and final_cash == 0:
                final_cash = s.total_amount
            elif s.payment_method == 'MPESA' and final_mpesa == 0:
                final_mpesa = s.total_amount
            
            method_display = s.payment_method
            if s.payment_method == 'SPLIT':
                method_display = f"SPLIT (Cash: {final_cash}, M-Pesa: {final_mpesa})"
            
            results.append({
                "id": s.id,
                "total_amount": s.total_amount,
                "amount_cash": final_cash,
                "amount_mpesa": final_mpesa,
                "payment_method": s.payment_method,
                "method_display": method_display,
                "status": s.status,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "cashier_name": s.cashier.name if s.cashier else "Unknown",
                "items_count": len(s.items)
            })
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"msg": "Failed to fetch transactions"}), 500

@transaction_bp.route('/export', methods=['GET'])
@jwt_required()
def export_transactions():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user.role.upper() == 'VENDOR':
            vendor_id = user.id
            sales = Sale.query.join(User, Sale.cashier_id == User.id)\
                .filter((User.id == vendor_id) | (User.vendor_id == vendor_id))\
                .order_by(Sale.created_at.desc()).all()
        else:
             return jsonify({"msg": "Unauthorized"}), 403

        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Sale ID', 'Date', 'Cashier', 'Method', 'Total', 'Cash Paid', 'M-Pesa Paid', 'Status'])
        
        for s in sales:
            final_cash = s.amount_cash or 0
            final_mpesa = s.amount_mpesa or 0

            if s.payment_method == 'CASH' and final_cash == 0:
                final_cash = s.total_amount
            elif s.payment_method == 'MPESA' and final_mpesa == 0:
                final_mpesa = s.total_amount

            writer.writerow([
                s.id, 
                s.created_at.strftime("%Y-%m-%d %H:%M"), 
                s.cashier.name if s.cashier else "Unknown",
                s.payment_method,
                s.total_amount,
                final_cash,
                final_mpesa,
                s.status
            ])
            
        output.seek(0)
        return Response(
            output, 
            mimetype="text/csv", 
            headers={"Content-Disposition": "attachment;filename=sales_report.csv"}
        )

    except Exception as e:
        print(f"Export Error: {e}")
        return jsonify({"msg": "Export failed"}), 500

@transaction_bp.route('/', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        cart_items = data.get('items', [])
        payment_method = data.get('payment_method', 'CASH').upper()
        coupon_code = data.get('coupon_code')
        
        req_cash = float(data.get('amount_cash', 0))
        req_mpesa = float(data.get('amount_mpesa', 0))
        
        if not cart_items:
            return jsonify({"msg": "Cart is empty"}), 400

        calculated_total = 0
        valid_items = []

        for item in cart_items:
            product = Product.query.get(item['id'])
            if not product:
                return jsonify({"msg": f"Product ID {item['id']} not found"}), 400
            
            if product.stock_quantity < item['quantity']:
                return jsonify({"msg": f"Insufficient stock for {product.name}"}), 400
            
            line_total = product.price * item['quantity']
            calculated_total += line_total
            
            valid_items.append({
                "product": product,
                "quantity": item['quantity'],
                "price": product.price
            })

        discount_amount = 0.0
        applied_coupon = None

        if coupon_code:
            user = User.query.get(current_user_id)
            vendor_id = user.id if user.role == 'VENDOR' else user.vendor_id
            
            coupon = DiscountCode.query.filter_by(code=coupon_code, vendor_id=vendor_id).first()
            
            if coupon and coupon.is_valid():
                discount_amount = (calculated_total * coupon.percentage) / 100
                applied_coupon = coupon.code

        final_total = calculated_total - discount_amount

        final_cash = 0.0
        final_mpesa = 0.0

        if payment_method == 'CASH':
            final_cash = final_total
        elif payment_method == 'MPESA':
            final_mpesa = final_total
        elif payment_method == 'SPLIT':
            if abs((req_cash + req_mpesa) - final_total) > 1.0:
                 return jsonify({"msg": f"Split amounts ({req_cash} + {req_mpesa}) do not match Total ({final_total})"}), 400
            final_cash = req_cash
            final_mpesa = req_mpesa

        new_sale = Sale(
            total_amount=final_total,
            discount_amount=discount_amount,
            coupon_code=applied_coupon,
            payment_method=payment_method,
            amount_cash=final_cash,
            amount_mpesa=final_mpesa,
            status='PENDING' if (payment_method == 'MPESA' or payment_method == 'SPLIT') else 'COMPLETED',
            cashier_id=current_user_id,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_sale)
        db.session.flush()

        for v_item in valid_items:
            product = v_item['product']
            qty = v_item['quantity']
            
            product.stock_quantity -= qty

            if product.stock_quantity <= 5:
                existing_alert = Notification.query.filter_by(
                    user_id=product.vendor_id, 
                    message=f"Low Stock Alert: {product.name} is down to {product.stock_quantity} items."
                ).first()

                if not existing_alert:
                    alert = Notification(
                        user_id=product.vendor_id, 
                        message=f"Low Stock Alert: {product.name} is down to {product.stock_quantity} items.",
                        type='warning'
                    )
                    db.session.add(alert)
            
            sale_item = SaleItem(
                sale_id=new_sale.id,
                product_id=product.id,
                product_name=product.name,
                quantity=qty,
                price=v_item['price']
            )
            db.session.add(sale_item)

        db.session.commit()

        return jsonify({
            "msg": "Transaction processed successfully", 
            "sale_id": new_sale.id,
            "total": final_total,
            "amount_mpesa": final_mpesa,
            "status": new_sale.status
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Transaction Error: {e}")
        return jsonify({"msg": f"Transaction failed: {str(e)}"}), 500

@transaction_bp.route('/validate-coupon', methods=['POST'])
@jwt_required()
def validate_coupon():
    try:
        data = request.get_json()
        code_text = data.get('code', '').upper().strip()
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        
        vendor_id = user.id if user.role == 'VENDOR' else user.vendor_id
        
        if not vendor_id:
             return jsonify({"msg": "Configuration Error: No linked vendor"}), 400

        coupon = DiscountCode.query.filter_by(code=code_text, vendor_id=vendor_id).first()

        if not coupon:
            return jsonify({"valid": False, "msg": "Invalid Code"}), 404
            
        if not coupon.is_valid():
            return jsonify({"valid": False, "msg": "Coupon Expired or Inactive"}), 400

        return jsonify({
            "valid": True, 
            "msg": "Coupon Applied!",
            "percentage": coupon.percentage,
            "code": coupon.code
        }), 200

    except Exception as e:
        print(f"Coupon Error: {e}")
        return jsonify({"msg": "Validation failed"}), 500

@transaction_bp.route('/coupons', methods=['GET'])
@jwt_required()
def get_available_coupons():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        vendor_id = user.id if user.role == 'VENDOR' else user.vendor_id
        
        if not vendor_id:
            return jsonify([]), 200

        all_codes = DiscountCode.query.filter_by(vendor_id=vendor_id, is_active=True).all()
        
        valid_codes = [c.to_dict() for c in all_codes if c.is_valid()]

        return jsonify(valid_codes), 200

    except Exception as e:
        print(f"Coupon Fetch Error: {e}")
        return jsonify([]), 500
