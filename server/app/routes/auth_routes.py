from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from app.models.user import User
from app.extensions import db
from app.utils.security import verify_password, hash_password
from app.utils.rbac import role_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not verify_password(data.get("password"), user.password_hash):
        return {"msg": "Invalid credentials"}, 401

    token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role}
    )

    return {
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }, 200


@auth_bp.route("/register", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def register():
    data = request.get_json()

    if User.query.filter_by(email=data.get("email")).first():
        return {"msg": "User already exists"}, 409

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hash_password(data["password"]),
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return {"msg": "User created"}, 201
