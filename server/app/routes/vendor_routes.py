from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.product import Product
from app.models.transaction import Sale, SaleItem
from app.models.wallet import Wallet, Settlement
from app.models.notification import Notification
from app.extensions import db
from sqlalchemy import func
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

vendor_bp = Blueprint('vendor_bp', __name__)

@vendor_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_vendor_stats():
    current_user_id = get_jwt_identity()
    
    total_sales = db.session.query(func.sum(SaleItem.price * SaleItem.quantity))\
        .join(Product).filter(Product.vendor_id == current_user_id)\
        .join(Sale).filter(Sale.status == 'COMPLETED').scalar() or 0.0

    wallet = Wallet.query.filter_by(vendor_id=current_user_id).first()
    balance = wallet.current_balance if wallet else 0.0

    product_count = Product.query.filter_by(vendor_id=current_user_id).count()
    
    low_stock = Product.query.filter(
        Product.vendor_id == current_user_id, 
        Product.stock_quantity < 10
    ).count()

    return jsonify({
        "today_sales": float(total_sales),
        "earnings": float(total_sales * 0.90),
        "balance": float(balance),
        "products": product_count,
        "total_orders": Sale.query.join(SaleItem).join(Product)\
            .filter(Product.vendor_id == current_user_id, Sale.status == 'COMPLETED')\
            .distinct().count(),
        "low_stock": low_stock
    }), 200

@vendor_bp.route('/sales-graph', methods=['GET'])
@jwt_required()
def get_vendor_graph():
    current_user_id = get_jwt_identity()
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

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

@vendor_bp.route('/wallet/request-withdrawal', methods=['POST'])
@jwt_required()
def request_withdrawal():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    amount = float(data.get('amount', 0))

    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400

    wallet = Wallet.query.filter_by(vendor_id=current_user_id).first()
    if not wallet or wallet.current_balance < amount:
        return jsonify({"msg": "Insufficient funds"}), 400

    wallet.current_balance -= amount
    
    settlement = Settlement(
        vendor_id=current_user_id,
        amount=amount, 
        status="pending" 
    )
    db.session.add(settlement)

    admin = User.query.filter((User.role == 'ADMIN') | (User.role == 'ADMINISTRATOR')).first()
    if admin:
        notif = Notification(
            user_id=admin.id,
            message=f"Withdrawal Request: {user.business_name or user.name} requested KES {amount:,.2f}",
            type="alert",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.session.add(notif)
    
    db.session.commit()

    return jsonify({"msg": "Withdrawal request submitted for approval"}), 200

@vendor_bp.route('/wallet/history', methods=['GET'])
@jwt_required()
def get_wallet_history():
    current_user_id = get_jwt_identity()
    
    transactions = Settlement.query.filter_by(vendor_id=current_user_id)\
        .order_by(Settlement.created_at.desc()).limit(20).all()

    return jsonify([{
        "id": t.id,
        "amount": float(t.amount),
        "status": t.status,
        "date": t.created_at.strftime("%Y-%m-%d %H:%M"),
        "type": "Withdrawal" if t.sale_id is None else "Sale Credit"
    } for t in transactions]), 200

@vendor_bp.route('/reports/export-pdf', methods=['GET'])
@jwt_required()
def export_vendor_pdf():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    sales = Sale.query.join(SaleItem).join(Product)\
        .filter(Product.vendor_id == current_user_id, Sale.status == 'COMPLETED')\
        .order_by(Sale.created_at.desc()).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(Paragraph(f"Sales Report: {user.business_name or user.name}", styles['Title']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    data = [['Date', 'Sale ID', 'Method', 'Total (KES)']]
    total_revenue = 0.0

    for s in sales:
        data.append([
            s.created_at.strftime('%Y-%m-%d'),
            f"#{s.id}",
            s.payment_method,
            f"{s.total_amount:,.2f}"
        ])
        total_revenue += s.total_amount

    data.append(['', '', 'GRAND TOTAL:', f"{total_revenue:,.2f}"])

    table = Table(data, colWidths=[100, 80, 100, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
    ]))

    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(
        buffer, 
        as_attachment=True, 
        download_name=f"Sales_Report_{datetime.now().date()}.pdf", 
        mimetype='application/pdf'
    )

@vendor_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    return jsonify({
        "business_name": user.business_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "receipt_footer": getattr(user, 'receipt_footer', 'Thank you for shopping with us!'),
        "business_logo": getattr(user, 'business_logo', '')
    }), 200

@vendor_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.get_json()

        if 'business_name' in data: user.business_name = data['business_name']
        if 'phone_number' in data: user.phone_number = data['phone_number']
        if 'receipt_footer' in data: user.receipt_footer = data['receipt_footer']
        if 'business_logo' in data: user.business_logo = data['business_logo']

        db.session.commit()
        return jsonify({"msg": "Profile updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Update failed: {str(e)}"}), 500