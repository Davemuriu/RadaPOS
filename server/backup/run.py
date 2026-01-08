from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)

#  CORS Configuration
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'
app.config['SECRET_KEY'] = 'dev-secret'

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# ===== MODELS =====
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='vendor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    vendor = db.relationship('User', backref='products')

# ===== DATABASE INITIALIZATION =====
def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        print('✓ Database tables created')
        
        # Create test vendor if none exists
        if not User.query.filter_by(email='vendor@example.com').first():
            vendor = User(
                name='Test Vendor',
                email='vendor@example.com',
                password=generate_password_hash('password123'),
                role='vendor'
            )
            db.session.add(vendor)
            db.session.commit()
            print('✓ Test vendor created: vendor@example.com / password123')
            
            # Create sample products
            sample_products = [
                Product(
                    name='Wireless Headphones',
                    description='Noise cancelling wireless headphones with premium sound quality',
                    price=79.99,
                    category='Electronics',
                    stock_quantity=15,
                    vendor_id=vendor.id
                ),
                Product(
                    name='Cotton T-Shirt',
                    description='100% cotton t-shirt, available in multiple colors',
                    price=19.99,
                    category='Clothing',
                    stock_quantity=45,
                    vendor_id=vendor.id
                ),
                Product(
                    name='Coffee Beans',
                    description='Premium arabica coffee beans, medium roast',
                    price=12.50,
                    category='Food & Beverage',
                    stock_quantity=8,
                    vendor_id=vendor.id
                ),
                Product(
                    name='Desk Lamp',
                    description='LED desk lamp with adjustable brightness',
                    price=34.99,
                    category='Home & Garden',
                    stock_quantity=22,
                    vendor_id=vendor.id
                ),
            ]
            
            for product in sample_products:
                db.session.add(product)
            
            db.session.commit()
            print('✓ 4 sample products created')

# ===== ROUTES =====
@app.route('/')
def home():
    return '🚀 RadaPOS Backend is running!'

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'rada-pos-backend',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', 'Vendor')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role=data.get('role', 'vendor')
        )
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            },
            'access_token': access_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            },
            'access_token': access_token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== PRODUCT ROUTES =====
@app.route('/api/products/vendor', methods=['GET'])
@jwt_required()
def get_vendor_products():
    try:
        user_id = get_jwt_identity()
        products = Product.query.filter_by(vendor_id=user_id).all()
        
        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'description': p.description or '',
                'price': p.price,
                'category': p.category,
                'stock_quantity': p.stock_quantity,
                'image_url': p.image_url or '',
                'vendor_id': p.vendor_id,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in products]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        data = request.form
        
        # Required fields
        required = ['name', 'price', 'category']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        product = Product(
            name=data.get('name'),
            description=data.get('description', ''),
            price=float(data.get('price', 0)),
            category=data.get('category'),
            stock_quantity=int(data.get('stock_quantity', 0)),
            vendor_id=user_id
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'category': product.category,
                'stock_quantity': product.stock_quantity
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        user_id = get_jwt_identity()
        product = Product.query.get_or_404(product_id)
        
        if product.vendor_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.form
        
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = float(data['price'])
        if 'category' in data:
            product.category = data['category']
        if 'stock_quantity' in data:
            product.stock_quantity = int(data['stock_quantity'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'category': product.category,
                'stock_quantity': product.stock_quantity
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        product = Product.query.get_or_404(product_id)
        
        if product.vendor_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===== DASHBOARD ROUTES =====
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        
        # Product stats
        total_products = Product.query.filter_by(vendor_id=user_id).count()
        low_stock = Product.query.filter(
            Product.vendor_id == user_id,
            Product.stock_quantity < 10
        ).count()
        
        # Categories
        categories = {}
        products = Product.query.filter_by(vendor_id=user_id).all()
        for product in products:
            categories[product.category] = categories.get(product.category, 0) + 1
        
        categories_list = [{'category': k, 'count': v} for k, v in categories.items()]
        
        # Mock sales data (replace with actual orders later)
        weekly_sales = [
            {'day': 'Mon', 'sales': 1200},
            {'day': 'Tue', 'sales': 1900},
            {'day': 'Wed', 'sales': 1500},
            {'day': 'Thu', 'sales': 2200},
            {'day': 'Fri', 'sales': 1800},
            {'day': 'Sat', 'sales': 2500},
            {'day': 'Sun', 'sales': 2100},
        ]
        
        return jsonify({
            'total_products': total_products,
            'low_stock': low_stock,
            'categories': categories_list,
            'weekly_sales': weekly_sales,
            'monthly_revenue': 12450,
            'total_orders': 156,
            'new_customers': 24
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== STAFF ROUTES =====
@app.route('/api/staff', methods=['POST'])
@jwt_required()
def create_staff():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role != 'vendor':
            return jsonify({'error': 'Only vendors can create staff'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'Name, email and password required'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        staff = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role='cashier'
        )
        
        db.session.add(staff)
        db.session.commit()
        
        return jsonify({
            'message': 'Staff member created successfully',
            'staff': {
                'id': staff.id,
                'name': staff.name,
                'email': staff.email,
                'role': staff.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/staff', methods=['GET'])
@jwt_required()
def get_staff():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if current_user.role == 'vendor':
            staff = User.query.filter_by(role='cashier').all()
        else:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({
            'staff': [{
                'id': s.id,
                'name': s.name,
                'email': s.email,
                'role': s.role,
                'created_at': s.created_at.isoformat() if s.created_at else None
            } for s in staff]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== MAIN =====
if __name__ == '__main__':
    # Initialize database
    init_database()
    
    print('=' * 60)
    print(' RadaPOS Backend - Vendor Management System')
    print('=' * 60)
    print('Database: SQLite (app.db)')
    print(' Test Vendor: vendor@example.com / password123')
    print(' CORS Enabled: http://localhost:5173')
    print(' API Base: http://localhost:5000/api')
    print('=' * 60)
    print(' Starting server...')
    print('=' * 60)
    
    app.run(debug=True, port=5000)