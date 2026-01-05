# app/routes/admin_routes.py
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

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
# ADMIN USER MANAGEMENT (Administrator only)
# ---------------------------
@admin_bp.post("/users")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def create_admin_user():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    admin_role = data.get("admin_role")

    if not name or not email or not password or not admin_role:
        return jsonify({"error": "name, email, password, admin_role are required"}), 400

    if admin_role not in (AdminRoles.ADMINISTRATOR, AdminRoles.MANAGER, AdminRoles.ACCOUNTANT):
        return jsonify({"error": "Invalid admin_role"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    actor_id = _current_user_id()

    user = User(name=name, email=email, role=Roles.ADMIN, admin_role=admin_role)
    user.set_password(password)

    db.session.add(user)

    # audit
    log_audit(
        actor_id=actor_id,
        action="ADMIN_USER_CREATE",
        entity_type="User",
        entity_id=None,
        before=None,
        after={"email": email, "role": Roles.ADMIN, "admin_role": admin_role},
    )

    db.session.commit()
    return jsonify({"message": "Admin user created", "user": user.to_dict()}), 201

# ---------------------------
# VENDOR WORKFLOW: submit -> approve/reject
# ---------------------------
@admin_bp.patch("/vendors/<int:vendor_id>/submit")
@admin_role_required(AdminRoles.MANAGER, AdminRoles.ADMINISTRATOR)
def submit_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)

    if vendor.status not in (ApprovalStatus.DRAFT, ApprovalStatus.RETURNED):
        return jsonify({"error": "Only DRAFT/RETURNED vendors can be submitted"}), 400

    actor_id = _current_user_id()
    before = vendor.to_dict()

    vendor.status = ApprovalStatus.SUBMITTED
    vendor.submitted_by = actor_id
    vendor.submitted_at = datetime.utcnow()

    after = vendor.to_dict()
    log_audit(actor_id=actor_id, action="VENDOR_SUBMIT", entity_type="Vendor", entity_id=vendor.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Vendor submitted for approval", "vendor": vendor.to_dict()}), 200

@admin_bp.patch("/vendors/<int:vendor_id>/approve")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def approve_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)

    if vendor.status != ApprovalStatus.SUBMITTED:
        return jsonify({"error": "Only SUBMITTED vendors can be approved"}), 400

    actor_id = _current_user_id()
    sod = _forbid_self_approval(vendor.submitted_by, actor_id)
    if sod:
        return jsonify(sod[0]), sod[1]

    data = request.get_json() or {}
    before = vendor.to_dict()

    vendor.status = ApprovalStatus.APPROVED
    vendor.approved_by = actor_id
    vendor.approved_at = datetime.utcnow()
    vendor.approval_notes = data.get("approval_notes")

    after = vendor.to_dict()
    log_audit(actor_id=actor_id, action="VENDOR_APPROVE", entity_type="Vendor", entity_id=vendor.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Vendor approved", "vendor": vendor.to_dict()}), 200

@admin_bp.patch("/vendors/<int:vendor_id>/reject")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def reject_vendor(vendor_id):
    vendor = Vendor.query.get_or_404(vendor_id)

    if vendor.status != ApprovalStatus.SUBMITTED:
        return jsonify({"error": "Only SUBMITTED vendors can be rejected"}), 400

    actor_id = _current_user_id()
    sod = _forbid_self_approval(vendor.submitted_by, actor_id)
    if sod:
        return jsonify(sod[0]), sod[1]

    data = request.get_json() or {}
    before = vendor.to_dict()

    vendor.status = ApprovalStatus.REJECTED
    vendor.approved_by = actor_id
    vendor.approved_at = datetime.utcnow()
    vendor.approval_notes = data.get("approval_notes")

    after = vendor.to_dict()
    log_audit(actor_id=actor_id, action="VENDOR_REJECT", entity_type="Vendor", entity_id=vendor.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Vendor rejected", "vendor": vendor.to_dict()}), 200

# ---------------------------
# PAYOUT WORKFLOW: submit -> approve -> process
# ---------------------------
@admin_bp.patch("/payouts/<int:payout_id>/submit")
@admin_role_required(AdminRoles.ACCOUNTANT, AdminRoles.ADMINISTRATOR)
def submit_payout(payout_id):
    payout = Payout.query.get_or_404(payout_id)

    if payout.status not in (ApprovalStatus.DRAFT, ApprovalStatus.RETURNED):
        return jsonify({"error": "Only DRAFT/RETURNED payouts can be submitted"}), 400

    actor_id = _current_user_id()
    before = payout.to_dict()

    payout.status = ApprovalStatus.SUBMITTED
    payout.submitted_by = actor_id
    payout.submitted_at = datetime.utcnow()

    after = payout.to_dict()
    log_audit(actor_id=actor_id, action="PAYOUT_SUBMIT", entity_type="Payout", entity_id=payout.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Payout submitted for approval", "payout": payout.to_dict()}), 200

@admin_bp.patch("/payouts/<int:payout_id>/approve")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def approve_payout(payout_id):
    payout = Payout.query.get_or_404(payout_id)

    if payout.status != ApprovalStatus.SUBMITTED:
        return jsonify({"error": "Only SUBMITTED payouts can be approved"}), 400

    actor_id = _current_user_id()
    sod = _forbid_self_approval(payout.submitted_by, actor_id)
    if sod:
        return jsonify(sod[0]), sod[1]

    data = request.get_json() or {}
    before = payout.to_dict()

    payout.status = ApprovalStatus.APPROVED
    payout.approved_by = actor_id
    payout.approved_at = datetime.utcnow()
    payout.approval_notes = data.get("approval_notes")

    after = payout.to_dict()
    log_audit(actor_id=actor_id, action="PAYOUT_APPROVE", entity_type="Payout", entity_id=payout.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Payout approved", "payout": payout.to_dict()}), 200

@admin_bp.patch("/payouts/<int:payout_id>/process")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def process_payout(payout_id):
    payout = Payout.query.get_or_404(payout_id)

    if payout.status != ApprovalStatus.APPROVED:
        return jsonify({"error": "Only APPROVED payouts can be processed"}), 400

    actor_id = _current_user_id()
    before = payout.to_dict()

    payout.processed_at = datetime.utcnow()

    after = payout.to_dict()
    log_audit(actor_id=actor_id, action="PAYOUT_PROCESS", entity_type="Payout", entity_id=payout.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Payout processed", "payout": payout.to_dict()}), 200

# ---------------------------
# PACKAGE WORKFLOW: create -> submit -> approve/reject
# ---------------------------
@admin_bp.post("/packages")
@admin_role_required(AdminRoles.ACCOUNTANT, AdminRoles.ADMINISTRATOR)
def create_package():
    data = request.get_json() or {}
    name = data.get("name")
    price = data.get("price")
    commission_percent = data.get("commission_percent")

    if not name or price is None or commission_percent is None:
        return jsonify({"error": "name, price, commission_percent are required"}), 400

    actor_id = _current_user_id()

    pkg = Package(
        name=name,
        description=data.get("description"),
        price=price,
        currency=data.get("currency", "KES"),
        commission_percent=commission_percent,
        status=ApprovalStatus.DRAFT,
        created_by=actor_id
    )
    db.session.add(pkg)

    log_audit(
        actor_id=actor_id,
        action="PACKAGE_CREATE",
        entity_type="Package",
        entity_id=None,
        before=None,
        after={"name": name, "price": str(price), "commission_percent": str(commission_percent), "status": ApprovalStatus.DRAFT},
    )

    db.session.commit()
    return jsonify({"message": "Package created (DRAFT)", "package": pkg.to_dict()}), 201

@admin_bp.patch("/packages/<int:package_id>/submit")
@admin_role_required(AdminRoles.ACCOUNTANT, AdminRoles.ADMINISTRATOR)
def submit_package(package_id):
    pkg = Package.query.get_or_404(package_id)

    if pkg.status not in (ApprovalStatus.DRAFT, ApprovalStatus.RETURNED):
        return jsonify({"error": "Only DRAFT/RETURNED packages can be submitted"}), 400

    actor_id = _current_user_id()
    before = pkg.to_dict()

    pkg.status = ApprovalStatus.SUBMITTED
    pkg.submitted_by = actor_id
    pkg.submitted_at = datetime.utcnow()

    after = pkg.to_dict()
    log_audit(actor_id=actor_id, action="PACKAGE_SUBMIT", entity_type="Package", entity_id=pkg.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Package submitted for approval", "package": pkg.to_dict()}), 200

@admin_bp.patch("/packages/<int:package_id>/approve")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def approve_package(package_id):
    pkg = Package.query.get_or_404(package_id)

    if pkg.status != ApprovalStatus.SUBMITTED:
        return jsonify({"error": "Only SUBMITTED packages can be approved"}), 400

    actor_id = _current_user_id()
    sod = _forbid_self_approval(pkg.submitted_by, actor_id)
    if sod:
        return jsonify(sod[0]), sod[1]

    data = request.get_json() or {}
    before = pkg.to_dict()

    pkg.status = ApprovalStatus.APPROVED
    pkg.approved_by = actor_id
    pkg.approved_at = datetime.utcnow()
    pkg.approval_notes = data.get("approval_notes")

    after = pkg.to_dict()
    log_audit(actor_id=actor_id, action="PACKAGE_APPROVE", entity_type="Package", entity_id=pkg.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Package approved", "package": pkg.to_dict()}), 200

@admin_bp.patch("/packages/<int:package_id>/reject")
@admin_role_required(AdminRoles.ADMINISTRATOR)
def reject_package(package_id):
    pkg = Package.query.get_or_404(package_id)

    if pkg.status != ApprovalStatus.SUBMITTED:
        return jsonify({"error": "Only SUBMITTED packages can be rejected"}), 400

    actor_id = _current_user_id()
    sod = _forbid_self_approval(pkg.submitted_by, actor_id)
    if sod:
        return jsonify(sod[0]), sod[1]

    data = request.get_json() or {}
    before = pkg.to_dict()

    pkg.status = ApprovalStatus.REJECTED
    pkg.approved_by = actor_id
    pkg.approved_at = datetime.utcnow()
    pkg.approval_notes = data.get("approval_notes")

    after = pkg.to_dict()
    log_audit(actor_id=actor_id, action="PACKAGE_REJECT", entity_type="Package", entity_id=pkg.id, before=before, after=after)

    db.session.commit()
    return jsonify({"message": "Package rejected", "package": pkg.to_dict()}), 200
