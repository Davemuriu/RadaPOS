from app import db
from datetime import datetime


# ================= SALES (POS) ==================

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)

    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    cashier_id = db.Column(db.Integer, db.ForeignKey('cashiers.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)

    order_total = db.Column(db.Float, nullable=False)
    amount_tendered = db.Column(db.Float, nullable=False)
    change_given = db.Column(db.Float, default=0.0)

    surplus_amount = db.Column(db.Float, default=0.0)
    surplus_type = db.Column(db.String(20))

    payment_method = db.Column(db.String(20), nullable=False)
    mpesa_code = db.Column(db.String(50))
    mpesa_verified = db.Column(db.Boolean, default=False)

    status = db.Column(db.String(20), default="completed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('SaleItem', backref='sale', lazy=True)


class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)

    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)


# FINANCIAL AUDIT 

class FinancialTransaction(db.Model):
    __tablename__ = "financial_transactions"

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, nullable=False)

    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(30))     # DIRECT_PAYOUT, WITHDRAWAL, SETTLEMENT
    status = db.Column(db.String(20))   # COMPLETED, FAILED

    recipient_name = db.Column(db.String(100))
    recipient_phone = db.Column(db.String(20))
    reference = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
