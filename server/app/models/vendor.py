# app/models/vendor.py
from datetime import datetime
from app.extensions import db

class Vendor(db.Model):
    __tablename__ = "vendors"

    id = db.Column(db.Integer, primary_key=True)

    business_name = db.Column(db.String(160), nullable=False)

    phone = db.Column(db.String(50), nullable=True)
    kra_pin = db.Column(db.String(40), nullable=True)

    package_id = db.Column(db.Integer, db.ForeignKey("packages.id"), nullable=True)

    status = db.Column(db.String(20), nullable=False, default="PENDING")

    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)

    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)

    approval_notes = db.Column(db.Text, nullable=True)

    # ✅ Owner of vendor profile
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ✅ Relationships (explicit foreign_keys to avoid ambiguity)
    owner = db.relationship(
        "User",
        back_populates="vendor_profile",
        foreign_keys=[owner_id],
    )

    submitted_by_user = db.relationship(
        "User",
        foreign_keys=[submitted_by],
        viewonly=True,
    )

    approved_by_user = db.relationship(
        "User",
        foreign_keys=[approved_by],
        viewonly=True,
    )

    package = db.relationship("Package", foreign_keys=[package_id])

    def to_dict(self):
        return {
            "id": self.id,
            "business_name": self.business_name,
            "phone": self.phone,
            "kra_pin": self.kra_pin,
            "package_id": self.package_id,
            "status": self.status,
            "submitted_by": self.submitted_by,
            "approved_by": self.approved_by,
            "approval_notes": self.approval_notes,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
