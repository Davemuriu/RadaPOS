import string
import secrets
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app.models.user import User
from app.extensions import db, bcrypt, mail
from app.utils.audit import audit_log 

staff_bp = Blueprint('staff_bp', __name__)

def generate_temp_password(length=8):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

@staff_bp.route('/', methods=['GET'])
@jwt_required()
def get_staff():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        if user.role.upper() in ['ADMIN', 'ADMINISTRATOR']:
            staff_members = User.query.filter_by(role='CASHIER').all()
            
        elif user.role.upper() == 'VENDOR':
            staff_members = User.query.filter_by(role='CASHIER', vendor_id=current_user_id).all()
            
        else:
            return jsonify([]), 200

        output = [staff.to_dict() for staff in staff_members]
        return jsonify(output), 200

    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"msg": "Error fetching staff"}), 500

@staff_bp.route('/', methods=['POST'])
@jwt_required()
@audit_log("Hired New Cashier") 
def add_staff():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role.upper() not in ['VENDOR', 'ADMIN', 'ADMINISTRATOR']:
             return jsonify({"msg": "Unauthorized action"}), 403

        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already registered"}), 400

        temp_password = generate_temp_password()
        hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
        
        new_staff = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role='CASHIER',
            phone_number=data.get('phone_number', ''),
            id_number=data.get('id_number', ''),
            must_change_password=True,
            vendor_id=current_user_id if current_user.role.upper() == 'VENDOR' else None 
        )
        
        db.session.add(new_staff)
        db.session.commit()

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
                RadaPOS Systems.
                """
            )
            mail.send(msg)
            print(f"Email sent successfully to {data['email']}")
            
        except Exception as email_error:
            print(f"EMAIL FAILED: {email_error}") 
            print(f"BACKUP CREDENTIALS -> Email: {data['email']} | Password: {temp_password}")

        return jsonify({
            'msg': 'Staff created successfully',
            'staff': new_staff.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error adding staff: {e}")
        return jsonify({"msg": "Failed to add staff"}), 500

@staff_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@audit_log("Fired Staff Member")
def delete_staff(id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        staff = User.query.get_or_404(id)
        
        if current_user.role.upper() == 'VENDOR':
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