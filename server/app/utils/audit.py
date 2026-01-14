from functools import wraps
from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
from app.models.audit import AuditLog
from app.models.user import User

def audit_log(action_name):
    """
    Decorator to log actions automatically.
    Usage: @audit_log("Created Product")
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            print(f"🔍 AUDIT DEBUG: Starting audit wrapper for {action_name}")
            
            try:
                response = f(*args, **kwargs)
            except Exception as e:
                print(f"❌ AUDIT DEBUG: Route failed with error: {e}")
                raise e
            
            status_code = 200
            if isinstance(response, tuple):
                status_code = response[1]
            
            print(f"🔍 AUDIT DEBUG: Route finished with Status {status_code}")

            if 200 <= status_code < 300:
                try:
                    print("🔍 AUDIT DEBUG: Attempting to log to DB...")
                    
                    verify_jwt_in_request(optional=True)
                    current_user_id = get_jwt_identity()
                    print(f"🔍 AUDIT DEBUG: User ID found: {current_user_id}")
                    
                    if current_user_id:
                        user = User.query.get(current_user_id)
                        
                        if user:
                            owner_id = user.id if user.role == 'VENDOR' else user.vendor_id
                            print(f"🔍 AUDIT DEBUG: User found: {user.name}, Owner ID: {owner_id}")
                            
                            log = AuditLog(
                                action=action_name,
                                user_id=user.id,
                                vendor_id=owner_id,
                                details=f"Path: {request.path}",
                                ip_address=request.remote_addr
                            )
                            db.session.add(log)
                            db.session.commit()
                            print(f"✅ AUDIT SUCCESS: Logged '{action_name}' to DB")
                        else:
                            print("❌ AUDIT DEBUG: User ID exists in token but User not found in DB")
                    else:
                        print("❌ AUDIT DEBUG: No User ID in JWT")
                        
                except Exception as e:
                    print(f"❌ AUDIT CRASH: {str(e)}")
                    import traceback
                    traceback.print_exc()
            else:
                print("⚠️ AUDIT SKIP: Status code indicates failure, not logging.")
            
            return response
        return decorated_function
    return decorator