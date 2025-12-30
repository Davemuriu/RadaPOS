from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.user import User
from app.models.transaction import Sale, SaleItem, MpesaPayment
from app.utils.mpesa import mpesa 

transaction_bp = Blueprint("transaction", __name__)


# 1. MPESA PAYMENT TRIGGER

@transaction_bp.route('/stk-push', methods=['POST'])
@jwt_required()
def trigger_stk_push():
    data = request.get_json()
    phone_number = data.get('phone_number')
    amount = data.get('amount')
    
    if not phone_number or not amount:
        return jsonify({"error": "Phone number and amount are required"}), 400

    response = mpesa.stk_push(phone_number, amount)
    return jsonify(response)



# 2. RECORD SALE

@transaction_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Permission Check
    vendor_id = None
    cashier_id = None

    if user.role == 'vendor':
        if not user.vendor_profile:
             return jsonify({"error": "Vendor profile incomplete"}), 400
        vendor_id = user.vendor_profile.id
        # Fallback for when Vendor makes a sale directly (requires cashier_id in model)
        cashier_id = request.json.get('cashier_id')
        if not cashier_id:
             return jsonify({"error": "Cashier ID is required (Database constraint)"}), 400
    
    elif user.role == 'cashier':
        if not user.cashier_profile:
             return jsonify({"error": "Cashier profile incomplete"}), 400
        vendor_id = user.cashier_profile.vendor_id  
        cashier_id = user.cashier_profile.id        
    else:
        return jsonify({"error": "Unauthorized"}), 403

    # Data Validation
    data = request.get_json()
    items = data.get("items") 
    event_id = data.get("event_id", 1) 
    
    if not items or not isinstance(items, list):
        return jsonify({"error": "Items must be a non-empty list"}), 400

    # Calculate Totals & Prepare Items
    total_amount = 0.0
    sale_items_to_create = []

    try:
        for item in items:
            prod_id = item.get("product_id")
            qty = int(item.get("qty", 1))
            price = float(item.get("price", 0))

            if not prod_id:
                return jsonify({"error": "Product ID is missing for one or more items"}), 400

            if qty <= 0 or price < 0:
                return jsonify({"error": "Invalid quantity or price"}), 400

            line_total = qty * price
            total_amount += line_total

            sale_items_to_create.append(
                SaleItem(
                    product_id=prod_id,
                    quantity=qty,
                    unit_price=price,
                    subtotal=line_total
                )
            )

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data format in items"}), 400

    # Create Sale Record
    new_sale = Sale(
        vendor_id=vendor_id,
        cashier_id=cashier_id,
        event_id=event_id,
        order_total=total_amount,
        amount_tendered=data.get("amount_tendered", total_amount),
        change_given=data.get("change_given", 0.0),
        payment_method=data.get("payment_method", "CASH"),
        mpesa_code=data.get("mpesa_code", None),
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(new_sale)
        db.session.flush() 

        for sale_item in sale_items_to_create:
            sale_item.sale_id = new_sale.id
            db.session.add(sale_item)

        db.session.commit()

        return jsonify({
            "message": "Transaction successful",
            "sale_id": new_sale.id,
            "total": total_amount,
            "sold_by": user.email
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Transaction failed", "details": str(e)}), 500



# 3. HISTORY ROUTE

@transaction_bp.route("/history", methods=["GET"])
@jwt_required()
def transaction_history():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    transactions = []

    if user.role == 'vendor' and user.vendor_profile:
        transactions = Sale.query.filter_by(vendor_id=user.vendor_profile.id).order_by(Sale.created_at.desc()).all()
    elif user.role == 'cashier' and user.cashier_profile:
        transactions = Sale.query.filter_by(vendor_id=user.cashier_profile.vendor_id).order_by(Sale.created_at.desc()).all()
    else:
        return jsonify({"error": "Unauthorized"}), 403

    output = []
    for sale in transactions:
        output.append({
            "id": sale.id,
            "total": sale.order_total,
            "payment_method": sale.payment_method,
            "date": sale.created_at.isoformat(),
            "cashier_id": sale.cashier_id
        })

    return jsonify(output), 200



# 4. MPESA CALLBACK (The Listener)

@transaction_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """
    Receives payment confirmation from Safaricom and logs it to the DB.
    """
    data = request.get_json()
    
    # Extract Body
    body = data.get('Body', {}).get('stkCallback', {})
    
    # Get IDs
    merchant_id = body.get('MerchantRequestID')
    checkout_id = body.get('CheckoutRequestID')
    result_code = body.get('ResultCode')
    result_desc = body.get('ResultDesc')
    
    amount = None
    receipt_no = None
    phone = None
    trans_date = None

    # Check Success (Code 0)
    if result_code == 0:
        meta_data = body.get('CallbackMetadata', {}).get('Item', [])
        
        def get_value(name):
            item = next((i for i in meta_data if i.get('Name') == name), None)
            return item.get('Value') if item else None

        amount = get_value('Amount')
        receipt_no = get_value('MpesaReceiptNumber')
        phone = get_value('PhoneNumber')
        trans_date = str(get_value('TransactionDate'))

    # Save to Database
    try:
        payment = MpesaPayment(
            merchant_request_id=merchant_id,
            checkout_request_id=checkout_id,
            result_code=result_code,
            result_desc=result_desc,
            amount=amount,
            mpesa_receipt_number=receipt_no,
            phone_number=phone,
            transaction_date=trans_date
        )
        
        db.session.add(payment)
        db.session.commit()
        
        print(f"💾 Saved M-Pesa Payment: {receipt_no} from {phone}")
        
    except Exception as e:
        print(f"❌ Error saving payment: {e}")
        db.session.rollback()

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# 5. POLLING ENDPOINT

@transaction_bp.route('/status/<checkout_request_id>', methods=['GET'])
@jwt_required()
def check_payment_status(checkout_request_id):
    """
    Frontend polls this endpoint to check if payment was received.
    """
    # 1. Look for the payment in our new table
    payment = MpesaPayment.query.filter_by(checkout_request_id=checkout_request_id).first()

    if payment:
        # 2. Payment Found! 
        if payment.result_code == 0:
            return jsonify({
                "status": "COMPLETED",
                "receipt": payment.mpesa_receipt_number,
                "amount": payment.amount,
                "message": "Payment received successfully"
            })
        else:
            return jsonify({
                "status": "FAILED",
                "message": payment.result_desc or "Payment failed"
            })
    
    # 3. Payment Not Found Yet (User hasn't entered PIN or Safaricom is slow)
    return jsonify({
        "status": "PENDING",
        "message": "Waiting for payment..."
    })