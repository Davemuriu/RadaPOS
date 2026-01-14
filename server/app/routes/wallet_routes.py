from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.wallet import Wallet, Withdrawal, Settlement
from app.models.wallet_ledger import WalletLedger
from app.utils.rbac import role_required
from app.services.daraja_service import DarajaService

wallet_bp = Blueprint("wallet", __name__)


@wallet_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("VENDOR")
def get_wallet():
    vendor_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    if not wallet:
        wallet = Wallet(vendor_id=vendor_id)
        db.session.add(wallet)
        db.session.commit()
    return {"current_balance": wallet.current_balance}, 200


@wallet_bp.route("/vendor/payout", methods=["POST"])
@jwt_required()
@role_required("VENDOR")
def vendor_payout():
    vendor_id = get_jwt_identity()
    data = request.json

    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    if not wallet:
        return {"msg": "Wallet not found"}, 404

    amount = float(data["amount"])
    category = data.get("category", "general")
    description = data.get("description", "")

    if wallet.current_balance < amount:
        return {"msg": "Insufficient wallet balance"}, 400

    wallet.current_balance -= amount
    wallet.last_updated = datetime.utcnow()

    ledger = WalletLedger(
        wallet_id=wallet.id,
        amount=amount,
        type="PAYOUT",
        category=category,
        description=description
    )

    db.session.add(ledger)
    db.session.commit()

    return {"msg": "Expense recorded", "new_balance": wallet.current_balance}, 200


@wallet_bp.route("/vendor/report", methods=["GET"])
@jwt_required()
@role_required("VENDOR")
def vendor_report():
    vendor_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()

    sales = db.session.query(db.func.sum(WalletLedger.amount))\
        .filter_by(wallet_id=wallet.id, type="SALE").scalar() or 0

    expenses = db.session.query(db.func.sum(WalletLedger.amount))\
        .filter_by(wallet_id=wallet.id, type="PAYOUT").scalar() or 0

    return {
        "total_sales": sales,
        "total_expenses": expenses,
        "net_profit": sales - expenses,
        "wallet_balance": wallet.current_balance
    }, 200


# ---- KEEP YOUR REAL WITHDRAW FLOW ----

@wallet_bp.route("/withdraw", methods=["POST"])
@jwt_required()
@role_required("VENDOR")
def request_withdrawal():
    vendor_id = get_jwt_identity()
    data = request.json

    amount = float(data["amount"])
    phone = data["phone"]

    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    if wallet.current_balance < amount:
        return {"msg": "Insufficient balance"}, 400

    withdrawal = Withdrawal(wallet_id=wallet.id, amount=amount)
    db.session.add(withdrawal)
    db.session.commit()

    response = DarajaService.b2c_payout(phone, amount, f"WDR-{withdrawal.id}")

    return {"msg": "Withdrawal initiated", "withdrawal_id": withdrawal.id}, 200
