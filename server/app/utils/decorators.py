# app/utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(*allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden", "message": "Insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_role_required(*allowed_admin_roles):
    """
    Requires: role == 'admin' AND admin_role in allowed_admin_roles
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

            if claims.get("role") != "admin":
                return jsonify({"error": "Forbidden", "message": "Admins only"}), 403

            if claims.get("admin_role") not in allowed_admin_roles:
                return jsonify({"error": "Forbidden", "message": "Insufficient admin role"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
