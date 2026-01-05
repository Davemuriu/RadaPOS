# app/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models.user import User
from app.constants.enums import Roles

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    """
    Public registration => vendor only.
    Admin users must be created by Administrator via /api/admin/users
    """
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    user = User(name=name, email=email, role=Roles.VENDOR)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registered", "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "Account disabled"}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "admin_role": user.admin_role,
            "email": user.email
        }
    )

    return jsonify({"access_token": token, "user": user.to_dict()}), 200
