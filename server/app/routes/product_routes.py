from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

product_bp = Blueprint('product_bp', __name__)

# GET PRODUCTS (ISOLATED)
@product_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"msg": "User not found"}), 404

        # 1. DATA ISOLATION LOGIC
        if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            # Admins see all products
            products = Product.query.all()
            
        elif user.role.upper() == 'VENDOR':
            # Vendors see ONLY their own products
            products = Product.query.filter_by(vendor_id=current_user_id).all()
            
        elif user.role.upper() == 'CASHIER':
            # Cashiers see products belonging to their Employing Vendor
            # Assuming 'vendor_id' on the User model points to their employer
            if user.vendor_id:
                products = Product.query.filter_by(vendor_id=user.vendor_id).all()
            else:
                products = []
        else:
            return jsonify([]), 200

        # 2. Serialize Output
        output = []
        for product in products:
            output.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'stock_quantity': product.stock_quantity,
                'description': product.description,
                'vendor_id': product.vendor_id,
                # Safe access for category in case it's null
                'category': getattr(product, 'category', 'General') 
            })
        return jsonify(output), 200

    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"msg": "Error fetching products"}), 500

# ADD PRODUCT
@product_bp.route('/', methods=['POST'])
@jwt_required()
def add_product():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        
        # Only Vendors can add products (Admins usually don't sell items directly)
        if not user or user.role.upper() != 'VENDOR':
            return jsonify({"msg": "Unauthorized. Only Vendors can add products."}), 403

        new_product = Product(
            name=data['name'],
            price=float(data['price']),
            stock_quantity=int(data['stock_quantity']),
            description=data.get('description', ''),
            category=data.get('category', 'General'),
            vendor_id=current_user_id # Automatically link to the logged-in Vendor
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'id': new_product.id,
            'name': new_product.name,
            'msg': "Product added successfully"
        }), 201

    except Exception as e:
        print(f"Error adding product: {e}")
        return jsonify({"msg": "Failed to add product"}), 500

# DELETE PRODUCT
@product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    try:
        current_user_id = get_jwt_identity()
        product = Product.query.get_or_404(id)
        
        # Strict Ownership Check: You can only delete your own products
        # Note: We cast to string/int to be safe, though IDs are usually ints
        if str(product.vendor_id) != str(current_user_id):
            return jsonify({"msg": "Unauthorized: You do not own this product"}), 403
            
        db.session.delete(product)
        db.session.commit()
        return jsonify({"msg": "Product deleted successfully"}), 200

    except Exception as e:
        print(f"Error deleting product: {e}")
        db.session.rollback()
        # Usually fails if product is linked to a SaleItem (Foreign Key Constraint)
        return jsonify({"msg": "Cannot delete product. It is part of existing sales history."}), 400
    
# UPDATE PRODUCT
@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    try:
        current_user_id = get_jwt_identity()
        
        # Filter by ID AND Vendor ID to ensure ownership in one query
        product = Product.query.filter_by(id=id, vendor_id=current_user_id).first()
        
        if not product:
            return jsonify({"msg": "Product not found or unauthorized"}), 404
            
        data = request.get_json()

        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)

        db.session.commit()
        return jsonify({"msg": "Product updated successfully", "id": product.id}), 200
        
    except Exception as e:
        print(f"Error updating product: {e}")
        return jsonify({"msg": "Failed to update product"}), 500