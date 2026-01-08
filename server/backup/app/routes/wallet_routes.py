# app/routes/wallet_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.user import User
from app.utils.rbac import role_required

wallet_bp = Blueprint('wallet', __name__)

# Get wallet balance (for vendors)
@wallet_bp.route('/balance', methods=['GET'])
@jwt_required()
@role_required('VENDOR')
def get_wallet_balance():
    user_id = get_jwt_identity()
    
    # For now, return a dummy balance
    # In a real app, you would have a Wallet model
    return jsonify({
        'balance': 0.0,
        'currency': 'KES',
        'user_id': user_id
    }), 200

# Get wallet transactions (for vendors)
@wallet_bp.route('/transactions', methods=['GET'])
@jwt_required()
@role_required('VENDOR')
def get_wallet_transactions():
    user_id = get_jwt_identity()
    
    # Return empty transactions for now
    # In a real app, you would query WalletTransaction model
    return jsonify({
        'transactions': [],
        'total': 0
    }), 200

# Admin: Get all vendor wallets
@wallet_bp.route('/vendor-wallets', methods=['GET'])
@jwt_required()
@role_required('ADMIN', 'MANAGER')
def get_vendor_wallets():
    vendors = User.query.filter_by(role='VENDOR', is_active=True).all()
    
    wallets = []
    for vendor in vendors:
        # Calculate vendor's total sales from products
        # This is a simplified version
        wallets.append({
            'vendor_id': vendor.id,
            'vendor_name': vendor.name,
            'business_name': vendor.business_name,
            'email': vendor.email,
            'balance': 0.0,  # Placeholder
            'currency': 'KES'
        })
    
    return jsonify({'wallets': wallets}), 200

# Update wallet balance (admin only)
@wallet_bp.route('/update-balance', methods=['POST'])
@jwt_required()
@role_required('ADMIN')
def update_wallet_balance():
    data = request.get_json()
    
    if not data or not data.get('vendor_id') or not data.get('amount'):
        return jsonify({'msg': 'Vendor ID and amount required'}), 400
    
    vendor = User.query.filter_by(id=data['vendor_id'], role='VENDOR').first()
    
    if not vendor:
        return jsonify({'msg': 'Vendor not found'}), 404
    
    # In a real app, you would update the Wallet model here
    return jsonify({
        'msg': 'Wallet balance would be updated',
        'vendor_id': vendor.id,
        'vendor_name': vendor.name,
        'amount': data['amount']
    }), 200