from app import db
from datetime import datetime

class WalletLedger(db.Model):
    __tablename__ = "wallet_ledger"

    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)

    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(30))   # SALE, PAYOUT, ADJUSTMENT
    category = db.Column(db.String(50))   # cashier, lunch, transport, etc
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
