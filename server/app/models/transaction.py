from app import db
from datetime import datetime

class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    cashier_id = db.Column(db.Integer, db.ForeignKey('cashiers.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    
    order_total = db.Column(db.Float, nullable=False)
    amount_tendered = db.Column(db.Float, nullable=False)
    change_given = db.Column(db.Float, default=0.0)
    
    payment_method = db.Column(db.String(20), nullable=False)
    mpesa_code = db.Column(db.String(50))
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

class MpesaPayment(db.Model):
    __tablename__ = 'mpesa_payments'

    id = db.Column(db.Integer, primary_key=True)
    merchant_request_id = db.Column(db.String(50), nullable=False)
    checkout_request_id = db.Column(db.String(50), nullable=False)
    result_code = db.Column(db.Integer, nullable=False)
    result_desc = db.Column(db.String(255))
    amount = db.Column(db.Float)
    mpesa_receipt_number = db.Column(db.String(20))
    phone_number = db.Column(db.String(15))
    transaction_date = db.Column(db.String(20))
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)