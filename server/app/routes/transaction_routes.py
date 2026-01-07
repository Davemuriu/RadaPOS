# app/routes/transaction_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func
from app.extensions import db
from app.models.transaction import Transaction
from app.utils.rbac import role_required

transaction_bp = Blueprint("transaction_bp", __name__)


# transaction_routes.py
@transaction_bp.route("/summary", methods=["GET"])
@jwt_required()
@role_required("ADMIN", "VENDOR")
def transaction_summary():
    user_id = int(get_jwt_identity())

    total_amount = db.session.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(Transaction.user_id == user_id).scalar()

    transaction_count = db.session.query(
        func.count(Transaction.id)
    ).filter(Transaction.user_id == user_id).scalar()

    return jsonify({
        "total_amount": total_amount,
        "transaction_count": transaction_count
    }), 200


# Optional: list all transactions for user
@transaction_bp.route("/transactions", methods=["GET"])
@jwt_required()
@role_required("ADMIN", "VENDOR")
def list_transactions():
    user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()

    data = []
    for t in transactions:
        data.append({
            "id": t.id,
            "amount": t.amount,
            "created_at": t.created_at.isoformat()
        })

    return jsonify(data), 200


