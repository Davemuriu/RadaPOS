# app/models/user.py
from datetime import datetime
from sqlalchemy.orm import relationship
from app.extensions import db, bcrypt
from app.constants.enums import Roles

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)

    # "admin" | "vendor" | "cashier"
    role = db.Column(db.String(20), nullable=False, index=True, default=Roles.VENDOR)

    # Only for role="admin": "ADMINISTRATOR" | "MANAGER" | "ACCOUNTANT"
    admin_role = db.Column(db.String(30), nullable=True, index=True)

    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    vendor_profile = relationship("Vendor", back_populates="owner", uselist=False)

    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "admin_role": self.admin_role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
