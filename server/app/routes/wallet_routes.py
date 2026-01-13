from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.wallet import Wallet, Withdrawal, Settlement
from app.services.daraja_service import MpesaService
import functools
from datetime import datetime

wallet_bp = Blueprint("wallet", __name__)

def role_required(role):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            from app.models.user import User
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role.upper() != role.upper():
                return jsonify({"msg": "Unauthorized. Vendor access only."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@wallet_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("VENDOR")
def get_wallet():
    vendor_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    
    if not wallet:
        wallet = Wallet(vendor_id=vendor_id, current_balance=0.0)
        db.session.add(wallet)
        db.session.commit()

    # Determine last updated time
    last_updated_time = datetime.utcnow()
    if hasattr(wallet, 'last_updated') and wallet.last_updated:
        last_updated_time = wallet.last_updated

    return jsonify({
        "current_balance": wallet.current_balance,
        "last_updated": last_updated_time.strftime("%Y-%m-%d %H:%M:%S")
    }), 200

@wallet_bp.route("/settlements", methods=["GET"])
@jwt_required()
@role_required("VENDOR")
def get_settlements():
    vendor_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    
    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404

    settlements = Settlement.query.filter_by(wallet_id=wallet.id)\
        .filter(Settlement.sale_id.is_(None))\
        .order_by(Settlement.created_at.desc())\
        .all()

    return jsonify([
        {
            "id": s.id,
            "sale_id": s.sale_id,
            "amount": s.amount,  
            "status": s.status,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for s in settlements
    ]), 200

@wallet_bp.route("/withdraw", methods=["POST"])
@jwt_required()
@role_required("VENDOR")
def request_withdrawal():
    vendor_id = get_jwt_identity()
    data = request.get_json()

    if not data or "amount" not in data or "phone" not in data:
        return jsonify({"msg": "Amount and phone required"}), 400

    try:
        amount = float(data["amount"])
    except ValueError:
        return jsonify({"msg": "Invalid amount format"}), 400
        
    phone = data["phone"]
    wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
    
    if not wallet or wallet.current_balance < amount:
        return jsonify({"msg": "Insufficient balance"}), 400

    # 1. Initiate M-Pesa B2C
    try:
        response = MpesaService.initiate_b2c(
            phone_number=phone,
            amount=amount,
            remarks="Withdrawal"
        )
    except Exception as e:
        return jsonify({"msg": "M-Pesa B2C Failed", "error": str(e)}), 500

    # 2. Deduct Balance Immediately
    wallet.current_balance -= amount
    
    # 3. Create Settlement Record 
    withdrawal = Settlement(
        wallet_id=wallet.id,
        amount=-amount,
        status="processing",
        mpesa_receipt=response.get("ConversationID")
    )

    db.session.add(withdrawal)
    db.session.commit()

    return jsonify({
        "msg": "Withdrawal initiated successfully",
        "new_balance": wallet.current_balance,
        "mpesa_ref": response.get("ConversationID")
    }), 200

@wallet_bp.route("/withdraw/callback", methods=["POST"])
def withdrawal_callback():
    data = request.get_json()

    try:
        result = data.get("Result", {})
        originator_id = result.get("OriginatorConversationID")
        result_code = result.get("ResultCode")

        withdrawal = Settlement.query.filter_by(mpesa_receipt=originator_id).first()
        
        if not withdrawal:
            return jsonify({"msg": "Withdrawal record not found"}), 404

        wallet = Wallet.query.get(withdrawal.wallet_id)

        if result_code == 0:
            withdrawal.status = "completed"
        else:
            # Refund wallet on failure
            withdrawal.status = "failed"
            wallet.current_balance += abs(withdrawal.amount)

        db.session.commit()

    except Exception as e:
        return jsonify({"msg": "Callback processing error", "error": str(e)}), 500

    return jsonify({"msg": "Withdrawal processed"}), 200