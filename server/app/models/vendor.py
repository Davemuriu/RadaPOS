# app/models/vendor.py
from datetime import datetime
from app.extensions import db
from app.constants.enums import ApprovalStatus

class Vendor(db.Model):
    __tablename__ = "vendors"

    id = db.Column(db.Integer, primary_key=True)

    business_name = db.Column(db.String(160), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    kra_pin = db.Column(db.String(40), nullable=True)

    # ✅ Vendor package (approved packages only in logic)
    package_id = db.Column(db.Integer, db.ForeignKey("packages.id"), nullable=True)
    package = db.relationship("Package", lazy="joined")

    # approval workflow
    status = db.Column(db.String(20), nullable=False, default=ApprovalStatus.DRAFT, index=True)
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    approval_notes = db.Column(db.Text, nullable=True)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    owner = db.relationship("User", back_populates="vendor_profile")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "business_name": self.business_name,
            "phone": self.phone,
            "kra_pin": self.kra_pin,
            "package_id": self.package_id,
            "package": self.package.to_dict() if self.package else None,
            "status": self.status,
            "submitted_by": self.submitted_by,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approval_notes": self.approval_notes,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
