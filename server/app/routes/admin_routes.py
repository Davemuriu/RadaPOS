from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
import jwt

from app.extensions import db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.payout import Payout
from app.models.package import Package
from app.utils.decorators import admin_role_required
from app.utils.audit import log_audit
from app.constants.enums import Roles, AdminRoles, ApprovalStatus

admin_bp = Blueprint("admin", __name__)

def _current_user_id() -> int:
    return int(get_jwt_identity())

def _forbid_self_approval(submitted_by: int | None, actor_id: int) -> tuple[dict, int] | None:
    if submitted_by is not None and int(submitted_by) == int(actor_id):
        return {"error": "Segregation of duties violation", "message": "You cannot approve what you submitted."}, 403
    return None

# ---------------------------
# ADMIN USER MANAGEMENT
# ---------------------------

@admin_bp.get("/users")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def get_admin_users():
    """Fetch all admin-level users for the management table."""
    users = User.query.filter_by(role=Roles.ADMIN).all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.post("/users")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def create_admin_user():
    """Creates a PENDING admin user and generates an invite link."""
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    admin_role = data.get("role") # Changed to 'role' to match your frontend formData

    if not name or not email or not admin_role:
        return jsonify({"error": "Missing required fields", "message": "name, email, and role are required"}), 400

    # Validate against your Enums
    valid_roles = [AdminRoles.ADMINISTRATOR, AdminRoles.MANAGER, AdminRoles.ACCOUNTANT]
    if admin_role not in valid_roles:
        return jsonify({"error": "Invalid role", "message": f"Allowed roles: {valid_roles}"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Conflict", "message": "Email already exists"}), 409

    actor_id = _current_user_id()

    # Create user with 'pending' status (assuming status field exists in User model)
    # We do NOT set a password here; the user sets it via the invite link
    user = User(
        name=name, 
        email=email, 
        role=Roles.ADMIN, 
        admin_role=admin_role,
        status="pending" 
    )

    db.session.add(user)
    db.session.flush() # Get user ID before commit

    # 1. Generate Invitation Token
    token = jwt.encode({
        'sub': email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    # 2. Audit Log
    log_audit(
        actor_id=actor_id,
        action="ADMIN_USER_INVITE",
        entity_type="User",
        entity_id=user.id,
        before=None,
        after={"email": email, "role": Roles.ADMIN, "admin_role": admin_role, "status": "pending"},
    )

    db.session.commit()

    # 3. Handle Invite Link (Terminal for Dev Mode)
    invite_url = f"http://localhost:5173/setup-password?token={token}"
    print(f"\n--- DEV INVITE LINK FOR {email} ---\n{invite_url}\n---")

    return jsonify({
        "message": "Invitation generated", 
        "user": user.to_dict(),
        "invite_link": invite_url # Optionally return this to frontend for easier testing
    }), 201

# ---------------------------
# ADMIN STATS
# ---------------------------
@admin_bp.get("/stats")
def get_stats():
    # In a real app, these would be dynamic queries:
    # total_rev = db.session.query(func.sum(Transaction.amount)).scalar()
    return jsonify({
        "total_collections": 1500000,
        "total_earnings": 225000,
        "total_vendors": Vendor.query.count(),
        "pending_withdrawals_count": Payout.query.filter_by(status=ApprovalStatus.SUBMITTED).count(),
        "active_events": [{"id": 1, "name": "Solfest", "revenue": 500000, "status": "active", "region": "Nairobi"}],
        "recent_withdrawals": [] 
    })

# ... rest of your vendor, payout, and package routes remain unchanged