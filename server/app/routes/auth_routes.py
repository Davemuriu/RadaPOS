from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models.user import User, Vendor, Cashier
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

# REGISTER (For Vendors only initially)
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 1. Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    # 2. Create the Base User
    new_user = User(
        email=data['email'],
        password=data['password'],
        role='vendor'
    )
    
    # 3. Create the Vendor Profile
    new_vendor = Vendor(
        user=new_user,
        business_name=data['business_name'],
        contact_phone=data.get('contact_phone', '')
    )

    # 4. Save to DB
    try:
        db.session.add(new_user)
        db.session.add(new_vendor)
        db.session.commit()
        return jsonify({"message": "Vendor registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# LOGIN 
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # 1. Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # 2. Verify password
    if user and user.check_password(data['password']):
        # 3. Create JWT Token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "business_name": user.vendor_profile.business_name if user.role == 'vendor' else None
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

#  GET CURRENT USER (Protected Route) 
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "email": user.email,
        "role": user.role
    }), 200