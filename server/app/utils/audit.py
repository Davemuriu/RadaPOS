# app/utils/audit.py
from flask import request
from app.extensions import db
from app.models.audit_log import AuditLog

def log_audit(
    *,
    actor_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    before: dict | None = None,
    after: dict | None = None,
):
    """
    Writes an audit record. Safe to call in any route/service.
    """
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    ua = request.headers.get("User-Agent")

    record = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before=before,
        after=after,
        ip_address=ip,
        user_agent=ua,
    )
    db.session.add(record)
    # do not commit here; let caller commit in the same transaction
