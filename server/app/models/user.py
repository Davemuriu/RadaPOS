from app.extensions import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) 
    
    # Staff/Security Logic
    must_change_password = db.Column(db.Boolean, default=False) 
    status = db.Column(db.String(20), default='active')

    # Self-Referential Relationship for Staff Management
    # This column links a Cashier/Staff member to the Vendor
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # COMMON PROFILE FIELDS
    name = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    id_number = db.Column(db.String(20), nullable=True) 
    profile_picture = db.Column(db.String(255), nullable=True) 

    # VENDOR SPECIFIC BUSINESS DETAILS
    business_name = db.Column(db.String(150), nullable=True)
    business_address = db.Column(db.String(255), nullable=True)
    kra_pin = db.Column(db.String(50), nullable=True)
    business_permit_no = db.Column(db.String(50), nullable=True)
    
    # VENDOR FINANCIAL DETAILS
    bank_name = db.Column(db.String(100), nullable=True)
    bank_account_number = db.Column(db.String(50), nullable=True)
    withdrawal_mpesa_number = db.Column(db.String(20), nullable=True)

    # NOTIFICATIONS
    notify_stock = db.Column(db.Boolean, default=True)
    notify_sales = db.Column(db.Boolean, default=False)
    notify_email = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', backref='vendor', lazy=True)
    
    # Backref 'employer' allows a cashier to access vendor info: user.employer
    # Backref 'staff_members' allows a vendor to list employees: user.staff_members
    staff_members = db.relationship(
        'User', 
        backref=db.backref('employer', remote_side=[id]),
        lazy='dynamic'
    )

    # AUTH METHODS
    def set_password(self, password_text):
        self.password = bcrypt.generate_password_hash(password_text).decode('utf-8')

    def check_password(self, password_candidate):
        return bcrypt.check_password_hash(self.password, password_candidate)

    # SERIALIZATION
    def to_dict(self):
        current_ev_id = self.assigned_events[-1].id if hasattr(self, 'assigned_events') and self.assigned_events else None
        
        base_data = {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "vendor_id": self.vendor_id,
            "name": self.name,
            "status": self.status,
            "phone_number": self.phone_number,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat(),
            "notify_stock": self.notify_stock,
            "notify_sales": self.notify_sales,
            "notify_email": self.notify_email,
            "id_number": self.id_number,
            "must_change_password": self.must_change_password
        }

        if self.role == 'VENDOR':
            base_data.update({
                "business_name": self.business_name,
                "business_address": self.business_address,
                "kra_pin": self.kra_pin,
                "business_permit_no": self.business_permit_no,
                "bank_name": self.bank_name,
                "bank_account_number": self.bank_account_number,
                "withdrawal_mpesa_number": self.withdrawal_mpesa_number,
                "current_event_id": current_ev_id
            })
            
        return base_data