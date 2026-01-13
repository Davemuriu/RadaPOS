from flask import Blueprint, request, jsonify
from app.models.transaction import Sale, SaleItem, MpesaPayment
from app.models.product import Product
from app.models.user import User
from app.extensions import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

transaction_bp = Blueprint('transaction_bp', __name__)

# MPESA CALLBACK
@transaction_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """Handles Safaricom STK Push results"""
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
        
        # Extract Receipt Number
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

# GET TRANSACTIONS
@transaction_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        # Multi-Tenancy Logic
        if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            sales = Sale.query.order_by(Sale.created_at.desc()).all()
        elif user.role.upper() == 'VENDOR':
            # Vendors see sales made by themselves AND their cashiers
            # We filter by User.parent_id if you have that, 
            # or by all sales linked to this vendor's business
            sales = Sale.query.join(User, Sale.cashier_id == User.id)\
                .filter((User.id == current_user_id) | (User.parent_id == current_user_id))\
                .order_by(Sale.created_at.desc()).all()
        else:
            sales = Sale.query.filter_by(cashier_id=current_user_id).order_by(Sale.created_at.desc()).all()
        
        return jsonify([{
            "id": s.id,
            "total_amount": s.total_amount,
            "payment_method": s.payment_method,
            "status": s.status,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "cashier_name": s.cashier.name if s.cashier else "Unknown",
            "items_count": len(s.items)
        } for s in sales]), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"msg": "Failed to fetch transactions"}), 500

# CREATE TRANSACTION
@transaction_bp.route('/', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        cart_items = data.get('items', [])
        payment_method = data.get('payment_method', 'CASH')
        
        if not cart_items:
            return jsonify({"msg": "Cart is empty"}), 400

        total_amount = 0
        new_sale = Sale(
            payment_method=payment_method,
            status='PENDING' if payment_method == 'MPESA' else 'COMPLETED',
            cashier_id=current_user_id,
            created_at=datetime.utcnow()
        )
        
        # Temporarily add to session to get ID
        db.session.add(new_sale)
        db.session.flush()

        for item in cart_items:
            product = Product.query.get(item['id'])
            if not product or product.stock_quantity < item['quantity']:
                db.session.rollback()
                return jsonify({"msg": f"Stock error for {product.name if product else 'item'}"}), 400
            
            product.stock_quantity -= item['quantity']
            line_total = product.price * item['quantity']
            total_amount += line_total
            
            db.session.add(SaleItem(
                sale_id=new_sale.id,
                product_id=product.id,
                product_name=product.name,
                quantity=item['quantity'],
                price=product.price
            ))

        new_sale.total_amount = total_amount
        db.session.commit()

        return jsonify({
            "msg": "Transaction processed", 
            "sale_id": new_sale.id,
            "total": total_amount,
            "status": new_sale.status
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Transaction Error: {e}")
        return jsonify({"msg": "Transaction failed"}), 500