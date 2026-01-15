from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.audit import AuditLog  
from app.extensions import db, bcrypt
from sqlalchemy import or_
from app.models.discount import DiscountCode

settings_bp = Blueprint('settings_bp', __name__)

# 1. PROFILE MANAGEMENT
@settings_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    return jsonify({
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "business_name": user.business_name or "",
        "phone_number": user.phone_number or "",
        "receipt_footer": getattr(user, 'receipt_footer', "Thank you for shopping with us!"),
        "business_logo": getattr(user, 'business_logo', "")
    }), 200

@settings_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'name' in data: user.name = data['name']
    if 'email' in data: user.email = data['email']
    if 'business_name' in data: user.business_name = data['business_name']
    if 'phone' in data: user.phone_number = data['phone']
    if 'phone_number' in data: user.phone_number = data['phone_number']
    
    if 'receipt_footer' in data: user.receipt_footer = data['receipt_footer']
    if 'business_logo' in data: user.business_logo = data['business_logo']
    
    try:
        db.session.commit()
        return jsonify({"msg": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Update failed", "error": str(e)}), 500

# 2. SECURITY MANAGEMENT
@settings_bp.route('/security/password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({"msg": "Both fields are required"}), 400

    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"msg": "Incorrect current password"}), 401

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    try:
        db.session.commit()
        return jsonify({"msg": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error changing password"}), 500

# 3. NOTIFICATION PREFERENCES
@settings_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    return jsonify({
        "notify_email": user.notify_email, 
        "notify_stock": user.notify_stock,
        "notify_sales": user.notify_sales
    }), 200

@settings_bp.route('/notifications', methods=['PUT'])
@jwt_required()
def update_notifications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'emailAlerts' in data: user.notify_email = data['emailAlerts']
    if 'notify_email' in data: user.notify_email = data['notify_email']

    if 'stockWarnings' in data: user.notify_stock = data['stockWarnings']
    if 'notify_stock' in data: user.notify_stock = data['notify_stock']

    if 'dailyReports' in data: user.notify_sales = data['dailyReports']
    if 'notify_sales' in data: user.notify_sales = data['notify_sales']
    
    try:
        db.session.commit()
        return jsonify({"msg": "Preferences saved"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to save preferences"}), 500

# 4. AUDIT LOGS 
@settings_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"msg": "User not found"}), 404

        if user.role.upper() == 'VENDOR':
            logs = AuditLog.query.filter(
                or_(
                    AuditLog.user_id == current_user_id,   
                    AuditLog.vendor_id == current_user_id  
                )
            ).order_by(AuditLog.created_at.desc()).limit(50).all()
            
        elif user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
            
        else:
            logs = AuditLog.query.filter_by(user_id=current_user_id).order_by(AuditLog.created_at.desc()).limit(20).all()

        return jsonify([log.to_dict() for log in logs]), 200

    except Exception as e:
        print(f"Error fetching audit logs: {e}")
        return jsonify({"msg": "Failed to fetch logs"}), 500

@settings_bp.route('/discounts', methods=['GET', 'POST'])
@jwt_required()
def handle_discounts():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'VENDOR':
        return jsonify({"msg": "Unauthorized"}), 403

    # GET: List all codes
    if request.method == 'GET':
        codes = DiscountCode.query.filter_by(vendor_id=current_user_id).order_by(DiscountCode.id.desc()).all()
        return jsonify([c.to_dict() for c in codes]), 200

    # POST: Create new code
    if request.method == 'POST':
        data = request.get_json()
        code_text = data.get('code', '').upper().strip()
        percentage = float(data.get('percentage', 0))

        if not code_text or percentage <= 0:
            return jsonify({"msg": "Invalid code or percentage"}), 400
            
        # Check if exists
        exists = DiscountCode.query.filter_by(code=code_text, vendor_id=current_user_id).first()
        if exists:
            return jsonify({"msg": "Code already exists"}), 400

        new_code = DiscountCode(
            code=code_text,
            percentage=percentage,
            vendor_id=current_user_id,
            is_active=True
        )
        db.session.add(new_code)
        db.session.commit()
        
        return jsonify({"msg": "Promo code created", "code": new_code.to_dict()}), 201

# DELETE DISCOUNT
@settings_bp.route('/discounts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_discount(id):
    current_user_id = get_jwt_identity()
    code = DiscountCode.query.filter_by(id=id, vendor_id=current_user_id).first()
    
    if not code:
        return jsonify({"msg": "Code not found"}), 404
        
    db.session.delete(code)
    db.session.commit()
    return jsonify({"msg": "Code deleted"}), 200