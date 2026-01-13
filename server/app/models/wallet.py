from app.extensions import db
from datetime import datetime

class Wallet(db.Model):
    __tablename__ = 'wallets'

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    current_balance = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    withdrawals = db.relationship('Withdrawal', backref='wallet', cascade="all, delete-orphan")
    settlements = db.relationship('Settlement', backref='wallet', cascade="all, delete-orphan")

class Withdrawal(db.Model):
    __tablename__ = 'withdrawals'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    status = db.Column(db.String(20), default='pending') 
    mpesa_conversation_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Settlement(db.Model):
    __tablename__ = 'settlements'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    sale_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=True) 
    amount = db.Column(db.Float, nullable=False) 
    status = db.Column(db.String(20), default='completed')
    mpesa_receipt = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)