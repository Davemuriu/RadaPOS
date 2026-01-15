from flask import Blueprint, jsonify
from app.models.transaction import Sale, SaleItem 
from app.models.product import Product
from app.models.user import User 
from app.extensions import db
from sqlalchemy import func
from datetime import date, datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/cashier-summary', methods=['GET'])
@jwt_required()
def get_cashier_summary():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Define Shift Window: Today (Adjusted for EAT +3)
        today_start_utc = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=3)
        
        # 1. Fetch Completed Sales for this cashier today
        todays_sales = Sale.query.filter(
            Sale.cashier_id == current_user_id,
            Sale.status == 'COMPLETED',
            Sale.created_at >= today_start_utc
        ).all()

        total_cash = sum(s.total_amount for s in todays_sales if s.payment_method == 'CASH')
        total_mpesa = sum(s.total_amount for s in todays_sales if s.payment_method == 'MPESA')
        
        # 2. Recent Sales (Last 5)
        all_time_sales = Sale.query.filter_by(cashier_id=current_user_id, status='COMPLETED')\
            .order_by(Sale.created_at.desc()).limit(5).all()
        
        recent_sales_data = []
        for s in all_time_sales:
            local_time = s.created_at + timedelta(hours=3)
            recent_sales_data.append({
                "id": s.id,
                "amount": float(s.total_amount),
                "method": s.payment_method,
                "time": local_time.strftime("%H:%M") 
            })

        # 3. Top Selling Products
        top_products_query = db.session.query(
            SaleItem.product_name, 
            func.sum(SaleItem.quantity).label('total_qty')
        ).join(Sale).filter(
            Sale.cashier_id == current_user_id,
            Sale.status == 'COMPLETED',
            Sale.created_at >= today_start_utc
        ).group_by(SaleItem.product_name).order_by(func.sum(SaleItem.quantity).desc()).limit(5).all()

        top_products = [{"name": row[0], "count": int(row[1])} for row in top_products_query]

        # 4. Low Stock Alerts
        vendor_id = user.vendor_id if user.role == 'CASHIER' else user.id
        low_stock_products = Product.query.filter(
            Product.vendor_id == vendor_id,
            Product.stock_quantity <= 5
        ).all()

        low_stock_alerts = [{"name": p.name, "stock": p.stock_quantity} for p in low_stock_products]

        return jsonify({
            "total_cash": float(total_cash),
            "total_mpesa": float(total_mpesa),
            "transactions_count": len(todays_sales),
            "recent_sales": recent_sales_data,
            "top_products": top_products,
            "low_stock_alerts": low_stock_alerts
        }), 200

    except Exception as e:
        print(f"Cashier Analytics Error: {e}")
        return jsonify({"msg": "Error fetching stats"}), 500
    
@analytics_bp.route('/shift-report', methods=['GET'])
@jwt_required()
def generate_shift_report():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Shift window (Today EAT)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=3)

        # Correct business name logic based on the 'employer' backref or 'vendor_id'
        business_name = "RadaPOS Retail"
        if user.role == 'CASHIER' and user.vendor_id:
            # Safely fetch vendor info
            vendor = User.query.get(user.vendor_id)
            business_name = vendor.business_name if vendor else "RadaPOS Retail"
        else:
            business_name = user.business_name or "RadaPOS Retail"

        sales = Sale.query.filter(
            Sale.cashier_id == current_user_id,
            Sale.status == 'COMPLETED',
            Sale.created_at >= today_start
        ).all()

        # Item summary using SQLAlchemy grouping
        item_summary_query = db.session.query(
            SaleItem.product_name, 
            func.sum(SaleItem.quantity),
            func.sum(SaleItem.quantity * SaleItem.price)
        ).join(Sale).filter(
            Sale.cashier_id == current_user_id,
            Sale.status == 'COMPLETED',
            Sale.created_at >= today_start
        ).group_by(SaleItem.product_name).all()

        report = {
            "cashier_name": user.name or "Unknown Cashier",
            "business_name": business_name,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time_generated": datetime.now().strftime("%H:%M:%S"),
            "totals": {
                "cash": float(sum(s.total_amount for s in sales if s.payment_method == 'CASH')),
                "mpesa": float(sum(s.total_amount for s in sales if s.payment_method == 'MPESA')),
                "grand_total": float(sum(s.total_amount for s in sales)),
                "transaction_count": len(sales)
            },
            "items": [{"name": r[0], "qty": int(r[1]), "revenue": float(r[2])} for r in item_summary_query]
        }

        return jsonify(report), 200
    except Exception as e:
        # Print error to terminal for debugging
        print(f"Shift Report Error: {str(e)}")
        return jsonify({"msg": "Failed to generate report", "error": str(e)}), 500