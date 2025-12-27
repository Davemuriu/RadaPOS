from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.user import User, Vendor, Cashier

from app.models.sale import Sale, SaleItem 

transaction_bp = Blueprint("transaction", __name__)

@transaction_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    """
    Records a new sale.
    - If User is a VENDOR: Records sale for their own business.
    - If User is a CASHIER: Records sale for their Employer (Vendor).
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    # 1. Determine Identity & Permissions
    vendor_id = None
    cashier_id = None

    if user.role == 'vendor':
        if not user.vendor_profile:
             return jsonify({"error": "Vendor profile incomplete"}), 400
        vendor_id = user.vendor_profile.id
    
    elif user.role == 'cashier':
        if not user.cashier_profile:
             return jsonify({"error": "Cashier profile incomplete"}), 400
        vendor_id = user.cashier_profile.vendor_id  
        cashier_id = user.cashier_profile.id        
        
    else:
        return jsonify({"error": "Unauthorized: Only Vendors or Cashiers can sell"}), 403

    # 2. Validate Request Data
    data = request.get_json()
    items = data.get("items") 
    
    if not items or not isinstance(items, list):
        return jsonify({"error": "Items must be a non-empty list"}), 400

    # 3. Calculate Total 
    total_amount = 0
    sale_items_to_create = []

    try:
        for item in items:
            name = item.get("name", "Unknown Item")
            qty = int(item.get("qty", 1))
            price = float(item.get("price", 0))

            if qty <= 0 or price < 0:
                return jsonify({"error": f"Invalid quantity or price for item {name}"}), 400

            line_total = qty * price
            total_amount += line_total

            # Prepare item record
            sale_items_to_create.append(
                SaleItem(
                    product_name=name,
                    quantity=qty,
                    price_at_sale=price
                )
            )

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data format in items"}), 400

    # 4. Create the Sale Record
    new_sale = Sale(
        vendor_id=vendor_id,
        cashier_id=cashier_id,
        total_amount=total_amount,
        payment_method=data.get("payment_method", "CASH"), 
        status="COMPLETED",
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(new_sale)
        db.session.flush() 

        # Link items to the sale
        for sale_item in sale_items_to_create:
            sale_item.sale_id = new_sale.id
            db.session.add(sale_item)

        db.session.commit()

        return jsonify({
            "message": "Transaction successful",
            "sale_id": new_sale.id,
            "total": total_amount,
            "sold_by": user.email,
            "vendor_id": vendor_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Transaction failed", "details": str(e)}), 500


@transaction_bp.route("/history", methods=["GET"])
@jwt_required()
def transaction_history():
    """
    Get sales history.
    - Vendors see ALL sales for their business.
    - Cashiers see ONLY their own sales (or all, depending on policy. Let's start with all).
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    transactions = []

    if user.role == 'vendor' and user.vendor_profile:
        transactions = Sale.query.filter_by(vendor_id=user.vendor_profile.id).order_by(Sale.created_at.desc()).all()
    
    elif user.role == 'cashier' and user.cashier_profile:

        transactions = Sale.query.filter_by(vendor_id=user.cashier_profile.vendor_id).order_by(Sale.created_at.desc()).all()

    else:
        return jsonify({"error": "Unauthorized"}), 403

    # Format output
    output = []
    for sale in transactions:
        output.append({
            "id": sale.id,
            "total": sale.total_amount,
            "payment_method": sale.payment_method,
            "date": sale.created_at.isoformat(),
            "sold_by_cashier": sale.cashier_id is not None
        })

    return jsonify(output), 200