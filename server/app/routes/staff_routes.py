import string
import secrets
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app.models.user import User
from app.extensions import db, bcrypt, mail

staff_bp = Blueprint('staff_bp', __name__)

def generate_temp_password(length=8):
    """Generates a random 8-character string for temporary access."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

# --- GET STAFF (ISOLATED) ---
@staff_bp.route('/', methods=['GET'])
@jwt_required()
def get_staff():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # 1. DATA ISOLATION LOGIC
        if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            # Admins see ALL cashiers
            staff_members = User.query.filter_by(role='CASHIER').all()
            
        elif user.role.upper() == 'VENDOR':
            # Vendors see ONLY their own staff (where vendor_id matches their ID)
            staff_members = User.query.filter_by(role='CASHIER', vendor_id=current_user_id).all()
            
        else:
            # Cashiers shouldn't really see this list, or maybe just themselves
            return jsonify([]), 200

        output = [staff.to_dict() for staff in staff_members]
        return jsonify(output), 200

    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"msg": "Error fetching staff"}), 500

# --- ADD STAFF (LINK TO VENDOR) ---
@staff_bp.route('/', methods=['POST'])
@jwt_required()
def add_staff():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Only Vendors and Admins can add staff
        if current_user.role.upper() not in ['VENDOR', 'ADMIN', 'ADMINISTRATOR']:
             return jsonify({"msg": "Unauthorized action"}), 403

        data = request.get_json()
        
        # 1. Validation
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already registered"}), 400

        # 2. Generate Temporary Password
        temp_password = generate_temp_password()
        hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
        
        # 3. Create User (Link to Vendor)
        new_staff = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role='CASHIER',
            phone_number=data.get('phone_number', ''),
            id_number=data.get('id_number', ''),
            must_change_password=True,
            # Link to the creator (The Vendor)
            # If Admin creates it, vendor_id might be null or selected manually (advanced feature)
            vendor_id=current_user_id if current_user.role.upper() == 'VENDOR' else None 
        )
        
        db.session.add(new_staff)
        db.session.commit()

        # 4. Send Email with Credentials
        try:
            msg = Message(
                subject="RadaPOS - Your Login Credentials",
                recipients=[data['email']],
                body=f"""
                Hello {data['name']},

                You have been added as a Cashier on RadaPOS.
                
                Here are your login details:
                Email: {data['email']}
                Temporary Password: {temp_password}

                Please login immediately. You will be prompted to change this password upon your first login.

                Regards,
                RadaPOS Team
                """
            )
            mail.send(msg)
            print(f"✅ Email sent successfully to {data['email']}")
            
        except Exception as email_error:
            # Log error but don't fail request
            print(f"⚠️ EMAIL FAILED: {email_error}") 
            print(f"🔐 BACKUP CREDENTIALS -> Email: {data['email']} | Password: {temp_password}")

        return jsonify({
            'msg': 'Staff created successfully',
            'staff': new_staff.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error adding staff: {e}")
        return jsonify({"msg": "Failed to add staff"}), 500

# --- DELETE STAFF (OWNERSHIP CHECK) ---
@staff_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_staff(id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        staff = User.query.get_or_404(id)
        
        # 1. Permission Check
        if current_user.role.upper() == 'VENDOR':
            # Vendor can only delete THEIR OWN staff
            # Compare IDs as strings/ints safely
            if str(staff.vendor_id) != str(current_user_id):
                return jsonify({"msg": "Unauthorized: This staff member does not belong to you"}), 403
                
        elif current_user.role.upper() not in ['ADMIN', 'ADMINISTRATOR']:
             return jsonify({"msg": "Unauthorized action"}), 403

        if staff.role != 'CASHIER':
             return jsonify({"msg": "Can only delete Cashiers via this route"}), 400
            
        db.session.delete(staff)
        db.session.commit()
        return jsonify({"msg": "Staff member deleted"}), 200

    except Exception as e:
        print(f"Delete Error: {e}")
        db.session.rollback()
        return jsonify({"msg": "Failed to delete staff"}), 500