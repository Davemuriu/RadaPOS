# app/utils/decorators.py
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def admin_role_required(*allowed_admin_roles):
    """
    Modified to support 'X-User-Role' header for initial setup 
    and standard JWT for production.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # 1. Bypass check for CORS preflight
            if request.method == 'OPTIONS':
                return fn(*args, **kwargs)

            # 2. Support dev header to avoid 401/405 before login
            dev_role = request.headers.get("X-User-Role")
            if dev_role == "Administrator":
                return fn(*args, **kwargs)

            # 3. Standard JWT protection
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if claims.get("role") != "admin":
                    return jsonify({"error": "Forbidden", "message": "Admins only"}), 403
                if claims.get("admin_role") not in allowed_admin_roles:
                    return jsonify({"error": "Forbidden", "message": "Insufficient admin role"}), 403
            except Exception:
                return jsonify({"error": "Unauthorized", "message": "Missing or invalid token"}), 401

            return fn(*args, **kwargs)
        return wrapper
    return decorator