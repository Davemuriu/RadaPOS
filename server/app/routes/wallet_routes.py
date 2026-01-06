from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.wallet import Wallet, Withdrawal, Settlement
import functools
from datetime import datetime

def role_required(role):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs)
        return wrapper
    return decorator

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

    return {
        "current_balance": wallet.current_balance,
        "last_updated": wallet.last_updated
    }, 200

@wallet_bp.route("/settlements", methods=["GET"])
@jwt_required()
@role_required("VENDOR")
def get_settlements():
    vendor_id = get_jwt_identity()

    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    if not wallet:
        return {"msg": "Wallet not found"}, 404

    settlements = Settlement.query.filter_by(wallet_id=wallet.id).all()

    return [
        {
            "event_id": s.event_id,
            "total_sales_volume": s.total_sales_volume,
            "platform_fee": s.platform_fee,
            "net_payout": s.net_payout,
            "status": s.status
        }
        for s in settlements
    ], 200

@wallet_bp.route("/withdraw", methods=["POST"])
@jwt_required()
@role_required("VENDOR")
def request_withdrawal():
    vendor_id = get_jwt_identity()
    data = request.get_json()

    if not data or "amount" not in data or "phone" not in data:
        return {"msg": "Amount and phone required"}, 400

    amount = float(data["amount"])
    phone = data["phone"]

    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    if not wallet or wallet.current_balance < amount:
        return {"msg": "Insufficient balance"}, 400

    withdrawal = Withdrawal(
        wallet_id=wallet.id,
        amount=amount,
        status="pending"
    )

    db.session.add(withdrawal)
    db.session.commit()

    # Initiate Daraja B2C payout
    response = DarajaService.b2c_payout(
        phone=phone,
        amount=amount,
        reference=f"WDR-{withdrawal.id}"
    )

    return {
        "msg": "Withdrawal initiated",
        "withdrawal_id": withdrawal.id,
        "mpesa_response": response
    }, 200

@wallet_bp.route("/withdraw/callback", methods=["POST"])
def withdrawal_callback():
    data = request.get_json()

    try:
        result = data["Result"]
        reference = result["OriginatorConversationID"]
        status = result["ResultCode"]

        withdrawal_id = int(reference.split("-")[-1])
        withdrawal = Withdrawal.query.get_or_404(withdrawal_id)
        wallet = Wallet.query.get_or_404(withdrawal.wallet_id)

        if status == 0:
            withdrawal.status = "completed"
            wallet.current_balance -= withdrawal.amount
        else:
            withdrawal.status = "failed"

        wallet.last_updated = datetime.utcnow()
        db.session.commit()

    except Exception:
        return {"msg": "Callback processing error"}, 500

    return {"msg": "Withdrawal processed"}, 200
