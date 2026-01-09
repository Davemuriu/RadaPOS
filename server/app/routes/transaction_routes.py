from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models.transaction import Sale, SaleItem
from app.models.product import Product
from app.utils.rbac import role_required

transaction_bp = Blueprint("transaction", __name__)


# ===========================
# POS CHECKOUT ENDPOINT
# ===========================
@transaction_bp.route("/checkout", methods=["POST"])
@jwt_required()
@role_required("VENDOR", "CASHIER")
def checkout():
    data = request.get_json()
    user_id = get_jwt_identity()

    if not data:
        return {"msg": "Request body is required"}, 400

    items = data.get("items")
    payment_method = data.get("payment_method", "cash")
    vendor_id = data.get("vendor_id")
    event_id = data.get("event_id")
    amount_tendered = float(data.get("amount_tendered", 0))
    mpesa_code = data.get("mpesa_code")
    offline = data.get("offline", False)

    if not items or not isinstance(items, list):
        return {"msg": "Items must be a non-empty list"}, 400

    if not vendor_id or not event_id:
        return {"msg": "vendor_id and event_id required"}, 400

    # ===== Server Side Price Authority =====
    total = 0
    validated_items = []

    for item in items:
        product = Product.query.get(item["product_id"])
        if not product or product.stock < item["qty"]:
            return {"msg": f"Stock unavailable for product {item['product_id']}"}, 400

        subtotal = product.price * item["qty"]
        total += subtotal
        validated_items.append((product, item["qty"], product.price, subtotal))

    if amount_tendered < total:
        return {"msg": "Amount tendered is less than total"}, 400

    surplus_amount = round(amount_tendered - total, 2)
    surplus_type = data.get("surplus_type") if surplus_amount > 0 else None

    # ===== Create Sale =====
    sale = Sale(
        vendor_id=vendor_id,
        cashier_id=user_id,
        event_id=event_id,
        order_total=total,
        amount_tendered=amount_tendered,
        change_given=surplus_amount if surplus_type == "refund" else 0,
        surplus_amount=surplus_amount,
        surplus_type=surplus_type,
        payment_method=payment_method,
        mpesa_code=mpesa_code,
        status="queued" if offline else "completed",
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(sale)
        db.session.flush()

        # ===== Record Items + Deduct Stock =====
        for product, qty, price, subtotal in validated_items:
            product.stock -= qty
            db.session.add(SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=qty,
                unit_price=price,
                subtotal=subtotal
            ))

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"msg": "Transaction failed", "error": str(e)}, 500

    return {
        "message": "Checkout successful",
        "transaction_id": sale.id,
        "total": sale.order_total,
        "surplus": surplus_amount,
        "surplus_type": surplus_type,
        "offline": offline,
        "timestamp": sale.created_at.isoformat()
    }, 201


# ===========================
# VENDOR LEDGER VIEW
# ===========================
@transaction_bp.route("/vendor/<int:vendor_id>", methods=["GET"])
@jwt_required()
@role_required("ADMIN", "VENDOR")
def get_vendor_transactions(vendor_id):

    transactions = Sale.query.filter_by(vendor_id=vendor_id).order_by(Sale.created_at.desc()).all()

    return [{
        "id": tx.id,
        "event_id": tx.event_id,
        "total": tx.order_total,
        "paid": tx.amount_tendered,
        "surplus": tx.surplus_amount,
        "surplus_type": tx.surplus_type,
        "method": tx.payment_method,
        "status": tx.status,
        "created_at": tx.created_at.isoformat()
    } for tx in transactions], 200
