from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'vendor', 'cashier'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    vendor_profile = db.relationship('Vendor', backref='user', uselist=False)
    cashier_profile = db.relationship('Cashier', backref='user', uselist=False)

class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    business_name = db.Column(db.String(100), nullable=False)
    kra_pin = db.Column(db.String(20))
    settlement_phone = db.Column(db.String(20))
    commission_rate = db.Column(db.Float, default=0.05)
    
    products = db.relationship('Product', backref='vendor', lazy=True)
    cashiers = db.relationship('Cashier', backref='vendor', lazy=True)

class Cashier(db.Model):
    __tablename__ = 'cashiers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    access_pin = db.Column(db.String(10), nullable=False)
    is_active = db.Column(db.Boolean, default=True)