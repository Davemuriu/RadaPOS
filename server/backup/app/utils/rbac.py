# app/utils/rbac.py - CORRECT VERSION
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(*required_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # THIS verifies the JWT
            verify_jwt_in_request()
            
            claims = get_jwt()
            user_role = claims.get('role')
            
            if user_role not in required_roles:
                return jsonify({'msg': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator