from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.utils.rbac import role_required
from app.utils.security import hash_password

user_bp = Blueprint("user", __name__)

@user_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def get_all_users():
    users = User.query.all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ], 200


@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }, 200


@user_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def create_user():
    data = request.get_json()
    required_fields = ["name", "email", "password", "role"]
    if not data or not all(field in data for field in required_fields):
        return {"msg": "Missing required fields"}, 400

    if User.query.filter_by(email=data["email"]).first():
        return {"msg": "User already exists"}, 409

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hash_password(data["password"]),
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return {
        "msg": "User created successfully",
        "user_id": user.id
    }, 201


@user_bp.route("/<int:user_id>/role", methods=["PUT"])
@jwt_required()
@role_required("ADMIN")
def update_user_role(user_id):
    data = request.get_json()
    if not data or "role" not in data:
        return {"msg": "Role is required"}, 400

    user = User.query.get_or_404(user_id)
    user.role = data["role"]
    db.session.commit()

    return {"msg": "User role updated"}, 200
@user_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return {"msg": "User deleted"}, 200