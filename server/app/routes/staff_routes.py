import string
import secrets
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from flask_mail import Message
from app.models.user import User
from app.extensions import db, bcrypt, mail

staff_bp = Blueprint('staff_bp', __name__)

def generate_temp_password(length=8):
    """Generates a random 8-character string for temporary access."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

@staff_bp.route('/', methods=['GET'])
@jwt_required()
def get_staff():
    try:
        # Fetch only Cashiers
        staff_members = User.query.filter_by(role='CASHIER').all()
        output = [staff.to_dict() for staff in staff_members]
        return jsonify(output), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"msg": "Error fetching staff"}), 500

@staff_bp.route('/', methods=['POST'])
@jwt_required()
def add_staff():
    try:
        data = request.get_json()
        
        # 1. Validation
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already registered"}), 400

        # 2. Generate Temporary Password
        temp_password = generate_temp_password()
        hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
        
        # 3. Create User (With Forced Password Change Flag)
        new_staff = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role='CASHIER',
            phone_number=data.get('phone_number', ''),
            id_number=data.get('id_number', ''),
            must_change_password=True
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
            # We log the error but don't fail the request, so the admin can still see the account was created
            print(f"⚠️ EMAIL FAILED: {email_error}") 
            # In dev, we print the password to the console as a backup
            print(f"🔐 BACKUP CREDENTIALS -> Email: {data['email']} | Password: {temp_password}")

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
def delete_staff(id):
    try:
        staff = User.query.get_or_404(id)
        if staff.role != 'CASHIER':
            return jsonify({"msg": "Unauthorized action"}), 403
            
        db.session.delete(staff)
        db.session.commit()
        return jsonify({"msg": "Staff member deleted"}), 200
    except Exception as e:
        return jsonify({"msg": "Failed to delete staff"}), 500