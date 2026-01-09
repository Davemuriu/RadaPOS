from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from app.models.user import User
from app import db


auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data.get("email")).first()

    if not user or not user.check_password(data.get("password")):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    if not current_user or current_user.role != 'ADMIN':
        return jsonify({"msg": "Unauthorized: Admins only"}), 403

    data = request.get_json()

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"msg": "User already exists"}), 409

    
    user = User(
        email=data["email"],
        password=data["password"], 
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User created"}), 201