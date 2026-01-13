from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

product_bp = Blueprint('product_bp', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        output = []
        for product in products:
            output.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'stock_quantity': product.stock_quantity,
                'description': product.description,
                'vendor_id': product.vendor_id
            })
        return jsonify(output), 200
    except Exception as e:
        return jsonify({"msg": "Error fetching products"}), 500

@product_bp.route('/', methods=['POST'])
@jwt_required()
def add_product():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        if not user or user.role != 'VENDOR':
            return jsonify({"msg": "Unauthorized. Only Vendors can add products."}), 403

        new_product = Product(
            name=data['name'],
            price=float(data['price']),
            stock_quantity=int(data['stock_quantity']),
            description=data.get('description', ''),
            vendor_id=current_user_id
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'id': new_product.id,
            'name': new_product.name,
            'price': new_product.price,
            'stock_quantity': new_product.stock_quantity,
            'description': new_product.description
        }), 201

    except Exception as e:
        print(f"Error adding product: {e}")
        return jsonify({"msg": "Failed to add product"}), 500

@product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    try:
        current_user_id = get_jwt_identity()
        product = Product.query.get_or_404(id)
        
        if int(product.vendor_id) != int(current_user_id):
            return jsonify({"msg": "Unauthorized"}), 403
            
        db.session.delete(product)
        db.session.commit()
        return jsonify({"msg": "Product deleted successfully"}), 200

    except Exception as e:
        print(f"Error deleting product: {e}")
        db.session.rollback()
        return jsonify({"msg": "Cannot delete product. It may be part of an existing transaction."}), 400
    
@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    vendor_id = get_jwt_identity()
    product = Product.query.filter_by(id=id, vendor_id=vendor_id).first_or_404()
    data = request.get_json()

    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
    product.description = data.get('description', product.description)
    product.category = data.get('category', product.category)

    db.session.commit()
    return jsonify({"msg": "Product updated successfully", "id": product.id}), 200