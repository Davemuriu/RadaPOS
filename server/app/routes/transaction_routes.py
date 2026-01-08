from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, Date, cast
from datetime import datetime, timedelta
from app.extensions import db
from app.models.transaction import Transaction
from app.models.user import User
from app.utils.rbac import role_required

transaction_bp = Blueprint('transaction', __name__)

# Create transaction
@transaction_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    data = request.get_json()
    
    if not data or not data.get('amount'):
        return jsonify({'msg': 'Amount is required'}), 400
    
    user_id = get_jwt_identity()
    
    transaction = Transaction(
        amount=float(data['amount']),
        user_id=user_id
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'msg': 'Transaction created', 'transaction': transaction.to_dict()}), 201

# Get transaction summary - matches your Dashboard component
@transaction_bp.route('/summary', methods=['GET'])
@jwt_required()
def transaction_summary():
    user_id = get_jwt_identity()
    # Get total amount and transaction count for the user
    total_amount = db.session.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(Transaction.user_id == user_id).scalar()
    
    transaction_count = db.session.query(
        func.count(Transaction.id)
    ).filter(Transaction.user_id == user_id).scalar()
    
    # Get daily sales for the last 7 days - matches your SalesChart
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    daily_sales = db.session.query(
        cast(Transaction.created_at, Date).label('date'),
        func.coalesce(func.sum(Transaction.amount), 0).label('amount')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.created_at >= seven_days_ago
    ).group_by(
        cast(Transaction.created_at, Date)
    ).order_by(
        cast(Transaction.created_at, Date)
    ).all()
    
    # Format daily sales for the chart
    formatted_daily_sales = [
        {
            'date': sale.date.strftime('%Y-%m-%d'),
            'amount': float(sale.amount)
        }
        for sale in daily_sales
    ]
    
    return jsonify({
        'total_amount': float(total_amount),
        'transaction_count': transaction_count,
        'daily_sales': formatted_daily_sales
    }), 200

# Get all transactions for user
@transaction_bp.route('', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    
    transactions = Transaction.query.filter_by(user_id=user_id)\
        .order_by(Transaction.created_at.desc())\
        .all()
    
    return jsonify({'transactions': [t.to_dict() for t in transactions]}), 200

# Admin: Get all transactions (all users)
@transaction_bp.route('/all', methods=['GET'])
@jwt_required()
@role_required('ADMIN', 'MANAGER')
def get_all_transactions():
    transactions = Transaction.query\
        .order_by(Transaction.created_at.desc())\
        .all()
    
    # Include user info
    result = []
    for t in transactions:
        transaction_data = t.to_dict()
        user = User.query.get(t.user_id)
        if user:
            transaction_data['user_name'] = user.name
            transaction_data['user_email'] = user.email
        result.append(transaction_data)
    
    return jsonify({'transactions': result}), 200