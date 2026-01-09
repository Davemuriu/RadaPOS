from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.utils.mpesa import mpesa
from app import db
from app.models.transaction import Sale, SaleItem, MpesaPayment

transaction_bp = Blueprint("transaction", __name__)

@transaction_bp.route('/stk-push', methods=['POST'])
@jwt_required()
def trigger_stk_push():
    data = request.get_json()
    phone_number = data.get('phone_number')
    amount = data.get('amount')
    
    if not phone_number or not amount:
        return jsonify({"error": "Phone number and amount are required"}), 400

    response = mpesa.stk_push(phone_number, amount)
    
    if "errorCode" in response:
        return jsonify(response), 400
        
    return jsonify(response), 200


@transaction_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    data = request.get_json()
    user_id = get_jwt_identity()

    if not data:
        return jsonify({"msg": "Request body is required"}), 400

    items = data.get("items")
    payment_method = data.get("payment_method", "OFFLINE")

    if not items or not isinstance(items, list):
        return jsonify({"msg": "Items must be a non-empty list"}), 400

    total = 0
    try:
        for item in items:
            price = float(item["price"])
            qty = int(item["qty"])
            if price < 0 or qty <= 0:
                raise ValueError
            total += price * qty
    except (KeyError, TypeError, ValueError):
        return jsonify({"msg": "Invalid item format"}), 400

    sale = Sale(
        vendor_id=user_id,
        total=total,
        is_offline=(payment_method == "OFFLINE"),
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(sale)
        db.session.flush()

        for item in items:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_name=item.get("name", "Unknown Item"), 
                quantity=int(item["qty"]),
                price=float(item["price"])
            )
            db.session.add(sale_item)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error recording transaction: {e}")
        return jsonify({"msg": "Failed to record transaction"}), 500

    return jsonify({
        "message": "Checkout successful",
        "transaction_id": sale.id,
        "total": sale.total,
        "offline": sale.is_offline,
        "timestamp": sale.created_at.isoformat()
    }), 201


@transaction_bp.route("/vendor/<int:vendor_id>", methods=["GET"])
@jwt_required()
def get_vendor_transactions(vendor_id):

    transactions = (
        Sale.query
        .filter_by(vendor_id=vendor_id)
        .order_by(Sale.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": tx.id,
            "total": tx.total,
            "offline": tx.is_offline,
            "created_at": tx.created_at.isoformat()
        }
        for tx in transactions
    ]), 200