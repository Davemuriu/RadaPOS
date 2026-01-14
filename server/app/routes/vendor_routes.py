from uuid import uuid4
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import request, Blueprint
from app.models.transaction import FinancialTransaction
from app.models.wallet import Wallet
from app import db
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/payout-direct', methods=['POST'])
@jwt_required()
def direct_payout():
    vendor_id = get_jwt_identity()
    data = request.json

    amount = float(data["amount"])
    name = data["recipient_name"]
    phone = data["phone"]

    if amount <= 0:
        return {"msg": "Invalid amount"}, 400

    try:
        with db.session.begin():
            wallet = Wallet.query.filter_by(vendor_id=vendor_id).with_for_update().first()

            if wallet.current_balance < amount:
                return {"msg": "Insufficient balance"}, 400

            wallet.current_balance -= amount

            txn = FinancialTransaction(
                vendor_id=vendor_id,
                amount=amount,
                type="DIRECT_PAYOUT",
                status="COMPLETED",
                recipient_name=name,
                recipient_phone=phone,
                reference=f"DP-{uuid4()}"
            )

            db.session.add(txn)

        return {"msg": "Direct payout successful"}, 200

    except:
        return {"msg": "Transaction failed"}, 500
