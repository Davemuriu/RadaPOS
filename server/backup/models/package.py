# app/models/package.py
from datetime import datetime
from app.extensions import db
from app.constants.enums import ApprovalStatus

class Package(db.Model):
    __tablename__ = "packages"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)

    # subscription fee (optional)
    price = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    currency = db.Column(db.String(10), nullable=False, default="KES")

    # ✅ PLATFORM COMMISSION (% of vendor revenue)
    # Example: 2.5 means 2.5%
    commission_percent = db.Column(db.Numeric(5, 2), nullable=False, default=0)

    # approval workflow
    status = db.Column(db.String(20), nullable=False, default=ApprovalStatus.DRAFT, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    approval_notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price),
            "currency": self.currency,
            "commission_percent": float(self.commission_percent),
            "status": self.status,
            "created_by": self.created_by,
            "submitted_by": self.submitted_by,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approval_notes": self.approval_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
