# app/models/wallet.py
from app import db
from datetime import datetime

class Wallet(db.Model):
    __tablename__ = 'wallets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(3), default='KES')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('wallet', uselist=False))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'balance': self.balance,
            'currency': self.currency,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'credit', 'debit', 'payment'
    reference = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    wallet = db.relationship('Wallet', backref='transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'reference': self.reference,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }