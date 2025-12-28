from flask import Blueprint, jsonify
from app.models.event import Event
from app.models.transaction import Transaction
from app.models.user import User
from app import db
from sqlalchemy import func

admin_api_bp = Blueprint('admin_api', __name__)

@admin_api_bp.route('/admin/stats', methods=['GET'])
def get_stats():
    # Summing successful transaction amounts for real revenue
    rev = db.session.query(func.sum(Transaction.amount)).filter(Transaction.status == 'success').scalar() or 0
    # Counting active events and pending payouts
    active_ev = Event.query.filter_by(status='active').count()
    pending_pay = Transaction.query.filter_by(type='withdrawal', status='pending').count()
    vendors_count = User.query.filter_by(role='vendor').count()

    return jsonify({
        "total_revenue": float(rev),
        "active_events": active_ev,
        "total_vendors": vendors_count,
        "pending_withdrawals": pending_pay
    }), 200

@admin_api_bp.route('/admin/users', methods=['GET'])
def get_users():
    # Fetching real user rows from the database
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200