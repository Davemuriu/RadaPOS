from flask import Blueprint, request, jsonify
from app import db


transaction_bp = Blueprint('transaction_bp', __name__)

@transaction_bp.route('/admin/withdrawals', methods=['GET'])
def get_payouts():
    # Placeholder logic: In a real app, you'd query your Withdrawal model
    # payouts = Withdrawal.query.filter_by(status='pending').all()
    mock_payouts = [
        {"id": 1, "vendor_name": "Tech Gadgets Store", "amount": 5000, "status": "pending"},
        {"id": 2, "vendor_name": "Fashion Hub", "amount": 1200, "status": "pending"}
    ]
    return jsonify(mock_payouts), 200

@transaction_bp.route('/admin/withdrawals/<int:id>/approve', methods=['PATCH'])
def approve_payout(id):
    # Logic to update payout status to 'completed'
    return jsonify({"message": f"Payout {id} approved and processed"}), 200