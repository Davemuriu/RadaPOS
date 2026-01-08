from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.product import Product
from app.models.user import User
from app.utils.rbac import role_required

product_bp = Blueprint('product', __name__)

# Get all products - matches your Products component
@product_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    # Check if user wants only their products (for vendors)
    my_products = request.args.get('my_products', 'false').lower() == 'true'
    vendor_id_filter = request.args.get('vendor_id')
    
    query = Product.query.filter_by(is_active=True)
    
    current_user_id = get_jwt_identity()
    current_user_role = get_jwt().get('role')
    
    # If vendor wants only their products
    if my_products and current_user_role == 'VENDOR':
        query = query.filter_by(vendor_id=current_user_id)
    elif vendor_id_filter:
        # Filter by specific vendor
        query = query.filter_by(vendor_id=vendor_id_filter)
    
    products = query.order_by(Product.created_at.desc()).all()
    return jsonify({'products': [product.to_dict() for product in products]}), 200

# Create product - matches your Inventory/ProductForm
@product_bp.route('', methods=['POST'])
@jwt_required()
@role_required('ADMIN', 'MANAGER', 'VENDOR')
def create_product():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('price'):
        return jsonify({'msg': 'Name and price are required'}), 400
    
    current_user_id = get_jwt_identity()
    current_user_role = get_jwt().get('role')
    
    # Determine vendor_id
    if current_user_role == 'VENDOR':
        # Vendor can only create products for themselves
        vendor_id = current_user_id
    else:
        # Admin/Manager can specify vendor_id
        vendor_id = data.get('vendor_id', current_user_id)
    
    # Check if vendor exists and is a VENDOR role
    vendor = User.query.get(vendor_id)
    if not vendor or vendor.role != 'VENDOR':
        return jsonify({'msg': 'Invalid vendor. Vendor must have VENDOR role.'}), 400
    
    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=float(data['price']),
        stock_quantity=data.get('stock_quantity', 0),
        image_url=data.get('image_url'),
        category=data.get('category'),
        barcode=data.get('barcode'),
        vendor_id=vendor_id
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'msg': 'Product created', 'product': product.to_dict()}), 201

# Get vendor's products
@product_bp.route('/vendor/<int:vendor_id>', methods=['GET'])
@jwt_required()
def get_vendor_products(vendor_id):
    vendor = User.query.get(vendor_id)
    
    if not vendor or vendor.role != 'VENDOR':
        return jsonify({'msg': 'Vendor not found'}), 404
    
    products = Product.query.filter_by(
        vendor_id=vendor_id,
        is_active=True
    ).order_by(Product.created_at.desc()).all()
    
    return jsonify({
        'vendor': vendor.to_dict(),
        'products': [product.to_dict() for product in products]
    }), 200

# Get my products (for vendors)
@product_bp.route('/my-products', methods=['GET'])
@jwt_required()
@role_required('VENDOR')
def get_my_products():
    vendor_id = get_jwt_identity()
    
    products = Product.query.filter_by(
        vendor_id=vendor_id,
        is_active=True
    ).order_by(Product.created_at.desc()).all()
    
    return jsonify({'products': [product.to_dict() for product in products]}), 200

# Get single product
@product_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)
    
    if not product or not product.is_active:
        return jsonify({'msg': 'Product not found'}), 404
    
    return jsonify(product.to_dict()), 200

# Update product
@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'msg': 'Product not found'}), 404
    
    current_user_id = get_jwt_identity()
    current_user_role = get_jwt().get('role')
    
    # Check permissions
    if current_user_role == 'VENDOR' and product.vendor_id != current_user_id:
        return jsonify({'msg': 'You can only update your own products'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = float(data['price'])
    if 'stock_quantity' in data:
        product.stock_quantity = int(data['stock_quantity'])
    if 'category' in data:
        product.category = data['category']
    if 'barcode' in data:
        product.barcode = data['barcode']
    if 'is_active' in data and current_user_role in ['ADMIN', 'MANAGER']:
        product.is_active = bool(data['is_active'])
    
    db.session.commit()
    
    return jsonify({'msg': 'Product updated', 'product': product.to_dict()}), 200

# Delete product
@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'msg': 'Product not found'}), 404
    
    current_user_id = get_jwt_identity()
    current_user_role = get_jwt().get('role')
    
    # Check permissions
    if current_user_role == 'VENDOR' and product.vendor_id != current_user_id:
        return jsonify({'msg': 'You can only delete your own products'}), 403
    
    # Soft delete
    product.is_active = False
    db.session.commit()
    
    return jsonify({'msg': 'Product deleted'}), 200