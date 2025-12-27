from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models.sale import Sale
from app.utils.rbac import role_required

transaction_bp = Blueprint("transaction", __name__)

@transaction_bp.route("/checkout", methods=["POST"])
@jwt_required()
@role_required("VENDOR", "CASHIER")
def checkout():
    data = request.get_json()
    user_id = get_jwt_identity()

    if not data:
        return {"msg": "Request body is required"}, 400

    items = data.get("items")
    payment_method = data.get("payment_method", "OFFLINE")

    if not items or not isinstance(items, list):
        return {"msg": "Items must be a non-empty list"}, 400

    # Calculate total server-side (anti-tampering)
    total = 0
    try:
        for item in items:
            price = float(item["price"])
            qty = int(item["qty"])
            if price < 0 or qty <= 0:
                raise ValueError
            total += price * qty
    except (KeyError, TypeError, ValueError):
        return {"msg": "Invalid item format"}, 400

    sale = Sale(
        vendor_id=user_id,
        total=total,
        is_offline=(payment_method == "OFFLINE"),
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(sale)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"msg": "Failed to record transaction"}, 500

    return {
        "message": "Checkout successful",
        "transaction_id": sale.id,
        "total": sale.total,
        "offline": sale.is_offline,
        "timestamp": sale.created_at.isoformat()
    }, 201

@transaction_bp.route("/vendor/<int:vendor_id>", methods=["GET"])
@jwt_required()
@role_required("ADMIN", "VENDOR")
def get_vendor_transactions(vendor_id):
    transactions = (
        Sale.query
        .filter_by(vendor_id=vendor_id)
        .order_by(Sale.created_at.desc())
        .all()
    )

    return [
        {
            "id": tx.id,
            "total": tx.total,
            "offline": tx.is_offline,
            "created_at": tx.created_at.isoformat()
        }
        for tx in transactions
    ], 200

