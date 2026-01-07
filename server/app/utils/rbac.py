from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("role", "").upper()
            allowed_roles = [r.upper() for r in roles]
            if user_role not in allowed_roles:
                return jsonify({"msg": "Access forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
