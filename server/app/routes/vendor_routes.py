from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.product import Product
from app.models.transaction import Sale, SaleItem
from app.models.wallet import Wallet, Settlement
from app.extensions import db
from sqlalchemy import func
from datetime import datetime, timedelta

vendor_bp = Blueprint('vendor_bp', __name__)

# 1. Vendor Dashboard Stats
@vendor_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_vendor_stats():
    current_user_id = get_jwt_identity()
    
    # FIX: Calculate subtotal on the fly (Price * Quantity)
    # Filter by products owned by this vendor
    total_sales = db.session.query(func.sum(SaleItem.price * SaleItem.quantity))\
        .join(Product).filter(Product.vendor_id == current_user_id)\
        .join(Sale).filter(Sale.status == 'COMPLETED').scalar() or 0.0

    # Wallet Balance
    wallet = Wallet.query.filter_by(vendor_id=current_user_id).first()
    balance = wallet.current_balance if wallet else 0.0

    # Product Count
    product_count = Product.query.filter_by(vendor_id=current_user_id).count()
    
    # Low Stock Alert (Count items with less than 10 units)
    low_stock = Product.query.filter(
        Product.vendor_id == current_user_id, 
        Product.stock_quantity < 10
    ).count()

    return jsonify({
        "today_sales": float(total_sales), # Total volume for dashboard
        "earnings": float(total_sales * 0.90), # Net after 10% platform fee
        "balance": float(balance),
        "products": product_count,
        "total_orders": Sale.query.join(SaleItem).join(Product)\
            .filter(Product.vendor_id == current_user_id, Sale.status == 'COMPLETED')\
            .distinct().count(),
        "low_stock": low_stock
    }), 200

# 2. Sales Trend Graph
@vendor_bp.route('/sales-graph', methods=['GET'])
@jwt_required()
def get_vendor_graph():
    """Sales volume for the last 7 days specific to this vendor"""
    current_user_id = get_jwt_identity()
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    # FIX: Calculate subtotal on the fly
    results = db.session.query(
        func.date(Sale.created_at).label('date'),
        func.sum(SaleItem.price * SaleItem.quantity).label('total')
    ).join(SaleItem).join(Product)\
    .filter(
        Product.vendor_id == current_user_id, 
        Sale.created_at >= start_date, 
        Sale.status == 'COMPLETED'
    )\
    .group_by(func.date(Sale.created_at)).all()

    data = [{"date": str(r.date), "amount": float(r.total)} for r in results]
    return jsonify(data), 200

# 3. Wallet & Withdrawal Requests
@vendor_bp.route('/wallet/request-withdrawal', methods=['POST'])
@jwt_required()
def request_withdrawal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    amount = float(data.get('amount', 0))

    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400

    wallet = Wallet.query.filter_by(vendor_id=current_user_id).first()
    if not wallet or wallet.current_balance < amount:
        return jsonify({"msg": "Insufficient funds"}), 400

    # 1. Deduct from Wallet immediately (move to 'frozen' state via balance reduction)
    wallet.current_balance -= amount
    
    # 2. Create Settlement Request
    # We link via vendor_id so Admin can see who requested it easily
    settlement = Settlement(
        vendor_id=current_user_id,
        amount=amount, 
        status="pending" 
    )
    
    db.session.add(settlement)
    db.session.commit()

    return jsonify({"msg": "Withdrawal request submitted for approval"}), 200

@vendor_bp.route('/wallet/history', methods=['GET'])
@jwt_required()
def get_wallet_history():
    current_user_id = get_jwt_identity()
    
    # Fetch all settlements (credits from sales and debits from withdrawals)
    transactions = Settlement.query.filter_by(vendor_id=current_user_id)\
        .order_by(Settlement.created_at.desc()).limit(20).all()

    return jsonify([{
        "id": t.id,
        "amount": float(t.amount),
        "status": t.status,
        "date": t.created_at.strftime("%Y-%m-%d %H:%M"),
        "type": "Withdrawal" if t.sale_id is None else "Sale Credit"
    } for t in transactions]), 200