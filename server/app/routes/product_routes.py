# app/routes/product_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.product import Product
from app.extensions import db
from app.utils.rbac import role_required

product_bp = Blueprint("product", __name__)

# Get all products (with vendor name included)
@product_bp.route("/", methods=["GET"], endpoint="get_products_list")
@jwt_required()
def get_products():
    products = Product.query.all()
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "vendor_name": p.vendor.business_name if p.vendor else None
        })
    return jsonify({"products": result}), 200

# Create product (VENDOR only)
@product_bp.route("/", methods=["POST"], endpoint="create_product")
@jwt_required()
@role_required("VENDOR")
def create_product():
    data = request.get_json()
    product = Product(
        name=data["name"],
        price=data["price"],
        description=data.get("description", "")
    )
    db.session.add(product)
    db.session.commit()
    return {"msg": "Product created", "product_id": product.id}, 201

# Update product (VENDOR only)
@product_bp.route("/<int:product_id>", methods=["PUT"], endpoint="update_product")
@jwt_required()
@role_required("VENDOR")
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    product.name = data.get("name", product.name)
    product.price = data.get("price", product.price)
    product.description = data.get("description", product.description)
    db.session.commit()
    return {"msg": "Product updated"}, 200

# Delete product (VENDOR only)
@product_bp.route("/<int:product_id>", methods=["DELETE"], endpoint="delete_product")
@jwt_required()
@role_required("VENDOR")
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return {"msg": "Product deleted"}, 200
