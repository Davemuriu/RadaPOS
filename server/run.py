from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# ===== INITIALIZE =====
app = Flask(__name__)
CORS(app)

# ===== CONFIG =====
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'dev-secret-key-change-in-production'
app.config['SECRET_KEY'] = 'dev-secret'

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ===== MODELS =====
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='vendor')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    vendor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ===== INITIALIZE DB =====
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create test vendor
        if not User.query.filter_by(email='vendor@example.com').first():
            vendor = User(
                name='Test Vendor',
                email='vendor@example.com',
                password=generate_password_hash('password123'),
                role='vendor'
            )
            db.session.add(vendor)
            db.session.commit()
            print('✓ Test vendor created')
            
            # Sample products
            products = [
                Product(name='Wireless Headphones', price=79.99, category='Electronics', stock_quantity=15, vendor_id=vendor.id),
                Product(name='Cotton T-Shirt', price=19.99, category='Clothing', stock_quantity=45, vendor_id=vendor.id),
                Product(name='Coffee Beans', price=12.50, category='Food & Beverage', stock_quantity=8, vendor_id=vendor.id),
            ]
            for p in products:
                db.session.add(p)
            db.session.commit()
            print('✓ Sample products created')

# ===== ROUTES =====
@app.route('/')
def home():
    return '🚀 RadaPOS Backend'

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

# ===== AUTH =====
@app.route('/api/login', methods=['POST'])
def login_user():  # Changed name to avoid conflict
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        token = create_access_token(identity=str(user.id))
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/register', methods=['POST'])
def register_user():  # Changed name to avoid conflict
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role=data.get('role', 'vendor')
    )
    
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

# ===== PRODUCTS =====
@app.route('/api/products/vendor', methods=['GET'])
@jwt_required()
def get_vendor_products():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    products = Product.query.filter_by(vendor_id=user_id).all()
    return jsonify({
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description or '',
            'price': p.price,
            'category': p.category,
            'stock_quantity': p.stock_quantity,
            'image_url': p.image_url or ''
        } for p in products]
    })

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    data = request.form
    
    # Validate
    if not data.get('name'):
        return jsonify({'error': 'Product name required'}), 400
    if not data.get('price'):
        return jsonify({'error': 'Price required'}), 400
    if not data.get('category'):
        return jsonify({'error': 'Category required'}), 400
    
    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=float(data['price']),
        category=data['category'],
        stock_quantity=int(data.get('stock_quantity', 0)),
        vendor_id=user_id
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'message': 'Product created',
        'product': {
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'category': product.category
        }
    }), 201

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    product = Product.query.get_or_404(product_id)
    
    if product.vendor_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted'})

# ===== DASHBOARD =====
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    total_products = Product.query.filter_by(vendor_id=user_id).count()
    low_stock = Product.query.filter(
        Product.vendor_id == user_id,
        Product.stock_quantity < 10
    ).count()
    
    return jsonify({
        'total_products': total_products,
        'low_stock': low_stock,
        'monthly_revenue': 12450,
        'total_orders': 156,
        'new_customers': 24,
        'weekly_sales': [
            {'day': 'Mon', 'sales': 1200},
            {'day': 'Tue', 'sales': 1900},
            {'day': 'Wed', 'sales': 1500},
            {'day': 'Thu', 'sales': 2200},
            {'day': 'Fri', 'sales': 1800},
            {'day': 'Sat', 'sales': 2500},
            {'day': 'Sun', 'sales': 2100},
        ]
    })

# ===== STAFF =====
@app.route('/api/staff', methods=['GET'])
@jwt_required()
def get_staff_members():  # Changed name
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    # Check if current user is vendor
    current_user = User.query.get(user_id)
    if current_user.role != 'vendor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    staff = User.query.filter_by(role='cashier').all()
    return jsonify({
        'staff': [{
            'id': s.id,
            'name': s.name,
            'email': s.email,
            'role': s.role,
            'created_at': s.created_at.isoformat() if s.created_at else None
        } for s in staff]
    })

@app.route('/api/staff', methods=['POST'])
@jwt_required()
def create_staff_member():  # Changed name
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    # Check if current user is vendor
    current_user = User.query.get(user_id)
    if current_user.role != 'vendor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    staff = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role='cashier'
    )
    
    db.session.add(staff)
    db.session.commit()
    
    return jsonify({
        'message': 'Staff created',
        'staff': {
            'id': staff.id,
            'name': staff.name,
            'email': staff.email,
            'role': staff.role
        }
    }), 201

# ===== TEST ENDPOINTS =====
@app.route('/api/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    user = User.query.get(user_id)
    
    return jsonify({
        'message': 'Auth works!',
        'user_id': user_id,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        } if user else None
    })

# ===== MAIN =====
if __name__ == '__main__':
    init_db()
    
    print('=' * 60)
    print('🎯 RadaPOS Backend - Ready!')
    print('=' * 60)
    print('👤 Test Vendor: vendor@example.com / password123')
    print('🌐 API: http://localhost:5000')
    print('🔗 CORS: Enabled for all origins')
    print('=' * 60)
    
    app.run(debug=True, port=5000)