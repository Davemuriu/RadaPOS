from app import db
from datetime import datetime
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='CASHIER')  # ADMIN, MANAGER, CASHIER, VENDOR
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    business_name = db.Column(db.String(200))  # Only for VENDOR role
    business_type = db.Column(db.String(100))  # Only for VENDOR role
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    products = db.relationship('Product', backref='vendor_user', lazy=True, foreign_keys='Product.vendor_id')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'address': self.address,
            'business_name': self.business_name if self.role == 'VENDOR' else None,
            'business_type': self.business_type if self.role == 'VENDOR' else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }
    
    def is_vendor(self):
        return self.role == 'VENDOR'
    
    def is_admin(self):
        return self.role == 'ADMIN'
    
    def is_manager(self):
        return self.role == 'MANAGER'
    
    def is_cashier(self):
        return self.role == 'CASHIER'