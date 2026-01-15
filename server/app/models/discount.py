from app.extensions import db
from datetime import datetime

class DiscountCode(db.Model):
    __tablename__ = 'discount_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    percentage = db.Column(db.Float, nullable=False) 
    is_active = db.Column(db.Boolean, default=True)
    expiry_date = db.Column(db.DateTime, nullable=True) 
    
    # Link to Vendor (So Vendor A's code doesn't work for Vendor B)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def is_valid(self):
        """Checks if code is active and not expired"""
        if not self.is_active:
            return False
        if self.expiry_date and self.expiry_date < datetime.utcnow():
            return False
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "percentage": self.percentage,
            "is_active": self.is_active,
            "expiry": self.expiry_date.strftime("%Y-%m-%d") if self.expiry_date else "Never"
        }