from app.extensions import db
from datetime import datetime

class Wallet(db.Model):
    __tablename__ = 'wallets'

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    current_balance = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = db.relationship('User', backref=db.backref('wallet', uselist=False))

class Settlement(db.Model):
    __tablename__ = 'settlements'

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sale_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    mpesa_receipt = db.Column(db.String(50), nullable=True)
    processed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vendor = db.relationship('User', backref='settlements')
    sale = db.relationship('Sale', backref='settlements')