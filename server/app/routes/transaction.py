from flask import Blueprint, jsonify

transaction_bp = Blueprint('transaction_bp', __name__)

@transaction_bp.route('/admin/withdrawals', methods=['GET'])
def get_payouts():
    # Return mock data so the dashboard isn't empty for the demo
    return jsonify([
        {"id": 1, "vendor_name": "Sample Vendor", "amount": 2500, "status": "pending"}
    ]), 200

@transaction_bp.route('/admin/withdrawals/<int:id>/approve', methods=['PATCH'])
def approve_payout(id):
    return jsonify({"message": "Approved"}), 200