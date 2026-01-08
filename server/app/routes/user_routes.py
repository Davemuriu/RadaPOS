from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.utils.rbac import role_required

user_bp = Blueprint('user', __name__)

# Create user (staff/cashier/vendor) - matches your StaffForm
@user_bp.route('', methods=['POST'])
@jwt_required()
@role_required('ADMIN', 'MANAGER')
def create_user():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Email and password required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'msg': 'Email already exists'}), 400
    
    role = data.get('role', 'CASHIER')
    
    # Validate role
    valid_roles = ['ADMIN', 'MANAGER', 'CASHIER', 'VENDOR']
    if role not in valid_roles:
        return jsonify({'msg': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
    
    user = User(
        name=data.get('name', ''),
        email=data['email'],
        role=role,
        phone=data.get('phone'),
        address=data.get('address')
    )
    
    # Add vendor-specific fields if role is VENDOR
    if role == 'VENDOR':
        user.business_name = data.get('business_name', '')
        user.business_type = data.get('business_type', '')
    
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'msg': 'User created successfully', 'user': user.to_dict()}), 201

# Get all users (with filtering by role)
@user_bp.route('', methods=['GET'])
@jwt_required()
@role_required('ADMIN', 'MANAGER')
def get_users():
    role_filter = request.args.get('role')
    
    query = User.query
    
    if role_filter:
        query = query.filter_by(role=role_filter.upper())
    
    users = query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200

# Get all vendors (specific endpoint for vendors)
@user_bp.route('/vendors', methods=['GET'])
@jwt_required()
def get_vendors():
    vendors = User.query.filter_by(role='VENDOR', is_active=True)\
        .order_by(User.created_at.desc())\
        .all()
    return jsonify({'vendors': [vendor.to_dict() for vendor in vendors]}), 200

# Get current user profile
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

# Update user profile
@user_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'address' in data:
        user.address = data['address']
    
    # Vendor-specific updates
    if user.role == 'VENDOR':
        if 'business_name' in data:
            user.business_name = data['business_name']
        if 'business_type' in data:
            user.business_type = data['business_type']
    
    db.session.commit()
    
    return jsonify({'msg': 'Profile updated', 'user': user.to_dict()}), 200

# Admin: Update any user
@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('ADMIN', 'MANAGER')
def update_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        # Check if email already exists for another user
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({'msg': 'Email already in use'}), 400
        user.email = data['email']
    if 'role' in data:
        valid_roles = ['ADMIN', 'MANAGER', 'CASHIER', 'VENDOR']
        if data['role'] not in valid_roles:
            return jsonify({'msg': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        user.role = data['role']
    if 'phone' in data:
        user.phone = data['phone']
    if 'address' in data:
        user.address = data['address']
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    
    # Vendor-specific fields
    if user.role == 'VENDOR':
        if 'business_name' in data:
            user.business_name = data['business_name']
        if 'business_type' in data:
            user.business_type = data['business_type']
    
    db.session.commit()
    
    return jsonify({'msg': 'User updated', 'user': user.to_dict()}), 200

# Delete/Deactivate user
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('ADMIN')
def delete_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    # Soft delete (deactivate)
    user.is_active = False
    db.session.commit()
    
    return jsonify({'msg': 'User deactivated'}), 200