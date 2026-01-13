from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app.extensions import db, bcrypt, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

auth_bp = Blueprint('auth_bp', __name__)

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

# REGISTER (For New Vendors)
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Simple validation
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Default register is VENDOR
        new_user = User(
            name=data.get('name'),
            email=data['email'],
            password=hashed_password,
            role='VENDOR',
            business_name=data.get('business_name'),
            must_change_password=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"msg": "Vendor registered successfully"}), 201
    except Exception as e:
        return jsonify({"msg": "Registration failed"}), 500

# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"msg": "Missing email or password"}), 400

        user = User.query.filter_by(email=data.get("email")).first()
        
        if not user or not user.check_password(data.get("password")):
            return jsonify({"msg": "Invalid credentials"}), 401
        
        # Create Token
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        
        # RESPONSE PAYLOAD
        return jsonify({
            "access_token": access_token, 
            "user": user.to_dict(),
            "role": user.role,
            "must_change_password": user.must_change_password
        }), 200
        
    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"msg": "Login failed"}), 500

# UPDATE PROFILE
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        data = request.get_json()

        # 1. CASHIER LOGIC
        if user.role == 'CASHIER':
            if 'profile_picture' in data:
                user.profile_picture = data['profile_picture']
            
            if any(key in data for key in ['name', 'phone_number', 'email', 'id_number']):
                return jsonify({
                    "msg": "Restricted. Cashiers cannot edit personal details. Contact Vendor."
                }), 403

        # 2. VENDOR LOGIC
        elif user.role == 'VENDOR':
            if 'name' in data: user.name = data['name']
            if 'phone_number' in data: user.phone_number = data['phone_number']
            if 'profile_picture' in data: user.profile_picture = data['profile_picture']
            if 'business_name' in data: user.business_name = data['business_name']
            if 'business_address' in data: user.business_address = data['business_address']
            if 'kra_pin' in data: user.kra_pin = data['kra_pin']
            if 'bank_name' in data: user.bank_name = data['bank_name']
            if 'bank_account_number' in data: user.bank_account_number = data['bank_account_number']
            if 'withdrawal_mpesa_number' in data: user.withdrawal_mpesa_number = data['withdrawal_mpesa_number']

        # 3. ADMIN LOGIC
        elif user.role == 'ADMIN':
            if 'name' in data: user.name = data['name']
            if 'phone_number' in data: user.phone_number = data['phone_number']
            if 'profile_picture' in data: user.profile_picture = data['profile_picture']

        db.session.commit()
        return jsonify({
            "msg": "Profile updated successfully",
            "user": user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Profile Update Error: {e}")
        return jsonify({"msg": "Failed to update profile"}), 500

# CHANGE PASSWORD (ALL ROLES)
@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.get_json()

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not user.check_password(current_password):
            return jsonify({"msg": "Incorrect current password"}), 401

        # Updated to 8 characters to match high-security frontend validation
        if len(new_password) < 8:
            return jsonify({"msg": "New password must be at least 8 characters"}), 400

        user.set_password(new_password)
        
        # CRITICAL: Turn off the flag after successful change
        if user.must_change_password:
            user.must_change_password = False
        
        db.session.commit()

        return jsonify({"msg": "Password changed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to change password"}), 500

# RESET PASSWORD LOGIC
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        email = data.get('email')

        if not token or not new_password:
            return jsonify({"msg": "Missing token or password"}), 400

        serializer = get_serializer()

        try:
            token_email = serializer.loads(token, salt='password-reset-salt', max_age=86400)
        except SignatureExpired:
            return jsonify({"msg": "The reset link has expired."}), 400
        except BadSignature:
            return jsonify({"msg": "Invalid reset link."}), 400

        if email and token_email != email:
             return jsonify({"msg": "Token does not match email."}), 400

        user = User.query.filter_by(email=token_email).first()
        if not user:
            return jsonify({"msg": "User not found."}), 404

        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({"msg": "Password updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Reset failed due to server error"}), 500