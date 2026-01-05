# app/models/payout.py
from datetime import datetime
from app.extensions import db
from app.constants.enums import ApprovalStatus

class Payout(db.Model):
    __tablename__ = "payouts"

    id = db.Column(db.Integer, primary_key=True)

    vendor_id = db.Column(db.Integer, db.ForeignKey("vendors.id"), nullable=False, index=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)

    # approval workflow
    status = db.Column(db.String(20), nullable=False, default=ApprovalStatus.DRAFT, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # typically vendor user
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # accountant
    submitted_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)   # administrator
    approved_at = db.Column(db.DateTime, nullable=True)

    processed_at = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    approval_notes = db.Column(db.Text, nullable=True)

    requested_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "vendor_id": self.vendor_id,
            "amount": float(self.amount),
            "status": self.status,
            "created_by": self.created_by,
            "submitted_by": self.submitted_by,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "notes": self.notes,
            "approval_notes": self.approval_notes,
        }
