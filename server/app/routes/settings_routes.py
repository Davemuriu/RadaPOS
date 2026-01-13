from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db, bcrypt

settings_bp = Blueprint('settings_bp', __name__)

# 1. PROFILE MANAGEMENT
@settings_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    # Map DB fields to Frontend expected JSON keys
    return jsonify({
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "business_name": user.business_name or "",
        "phone": user.phone_number or ""
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
    # Map frontend 'phone' to DB 'phone_number'
    if 'phone' in data: user.phone_number = data['phone']
    
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
        "emailAlerts": user.notify_email,
        "stockWarnings": user.notify_stock,
        "dailyReports": user.notify_sales
    }), 200

@settings_bp.route('/notifications', methods=['PUT'])
@jwt_required()
def update_notifications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'emailAlerts' in data: user.notify_email = data['emailAlerts']
    if 'stockWarnings' in data: user.notify_stock = data['stockWarnings']
    if 'dailyReports' in data: user.notify_sales = data['dailyReports']
    
    try:
        db.session.commit()
        return jsonify({"msg": "Preferences saved"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to save preferences"}), 500