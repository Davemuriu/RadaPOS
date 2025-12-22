from app import db
from datetime import datetime

class Wallet(db.Model):
    __tablename__ = 'wallets'

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    current_balance = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    withdrawals = db.relationship('Withdrawal', backref='wallet', lazy=True)

class Withdrawal(db.Model):
    __tablename__ = 'withdrawals'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    mpesa_reference = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending') 
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)

class Settlement(db.Model):
    __tablename__ = 'settlements'

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    
    total_sales_volume = db.Column(db.Float, default=0.0)
    platform_fee = db.Column(db.Float, default=0.0)
    net_payout = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='open')