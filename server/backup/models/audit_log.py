# app/models/audit_log.py
from datetime import datetime
from app.extensions import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)

    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    action = db.Column(db.String(80), nullable=False, index=True)  # e.g. VENDOR_SUBMIT, PAYOUT_APPROVE

    entity_type = db.Column(db.String(80), nullable=False, index=True)  # e.g. Vendor, Payout, Package
    entity_id = db.Column(db.Integer, nullable=True, index=True)

    # Postgres JSONB
    before = db.Column(db.JSON, nullable=True)
    after = db.Column(db.JSON, nullable=True)

    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "actor_id": self.actor_id,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "before": self.before,
            "after": self.after,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
