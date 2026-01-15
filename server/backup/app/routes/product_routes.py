from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.product import Product
from app.models.order import Order, OrderItem  # We'll create these models
from app import db
from datetime import datetime, timedelta
import cloudinary
import cloudinary.uploader
import os
import tempfile

product_bp = Blueprint('products', __name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# ... [Previous CRUD functions remain the same] ...

# Dashboard statistics
@product_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        current_user_id = get_jwt_identity()
        
        # Get date ranges
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Product stats
        total_products = Product.query.filter_by(vendor_id=current_user_id).count()
        low_stock = Product.query.filter(
            Product.vendor_id == current_user_id,
            Product.stock_quantity < 10
        ).count()
        
        # Categories distribution
        categories = db.session.query(
            Product.category,
            db.func.count(Product.id).label('count')
        ).filter_by(vendor_id=current_user_id)\
         .group_by(Product.category).all()
        
        # Mock sales data (replace with actual order queries)
        weekly_sales = [
            {'day': 'Mon', 'sales': 1200},
            {'day': 'Tue', 'sales': 1900},
            {'day': 'Wed', 'sales': 1500},
            {'day': 'Thu', 'sales': 2200},
            {'day': 'Fri', 'sales': 1800},
            {'day': 'Sat', 'sales': 2500},
            {'day': 'Sun', 'sales': 2100},
        ]
        
        monthly_revenue = 12450
        total_orders = 156
        new_customers = 24
        
        return jsonify({
            'total_products': total_products,
            'low_stock': low_stock,
            'categories': [{'category': c[0], 'count': c[1]} for c in categories],
            'weekly_sales': weekly_sales,
            'monthly_revenue': monthly_revenue,
            'total_orders': total_orders,
            'new_customers': new_customers
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500