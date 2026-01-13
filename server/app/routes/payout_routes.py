from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.utils.decorators import role_required
from app.models.payout import Payout, PayoutStatus

payout_bp = Blueprint("payouts", __name__)

@payout_bp.get("")
@role_required("admin")
def list_payouts():
    status = request.args.get("status")
    q = Payout.query
    if status:
        q = q.filter_by(status=status)
    payouts = q.order_by(Payout.requested_at.desc()).all()
    return jsonify([p.to_dict() for p in payouts]), 200

@payout_bp.post("")
@role_required("vendor")
def request_payout():
    data = request.get_json() or {}
    vendor_id = data.get("vendor_id")
    amount = data.get("amount")

    if not vendor_id or not amount:
        return jsonify({"error": "vendor_id and amount are required"}), 400

    payout = Payout(vendor_id=vendor_id, amount=amount, status=PayoutStatus.PENDING)
    db.session.add(payout)
    db.session.commit()
    return jsonify(payout.to_dict()), 201

@payout_bp.patch("/<int:payout_id>/approve")
@role_required("admin")
def approve_payout(payout_id):
    payout = Payout.query.get_or_404(payout_id)
    if payout.status != PayoutStatus.PENDING:
        return jsonify({"error": "Only PENDING payouts can be approved"}), 400
    payout.status = PayoutStatus.APPROVED
    db.session.commit()
    return jsonify(payout.to_dict()), 200

@payout_bp.patch("/<int:payout_id>/process")
@role_required("admin")
def process_payout(payout_id):
    payout = Payout.query.get_or_404(payout_id)
    if payout.status != PayoutStatus.APPROVED:
        return jsonify({"error": "Only APPROVED payouts can be processed"}), 400
    payout.status = PayoutStatus.PROCESSED
    payout.processed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(payout.to_dict()), 200
