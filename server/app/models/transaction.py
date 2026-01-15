from app.extensions import db
from datetime import datetime


class Sale(db.Model):
    __tablename__ = 'transactions'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    total_amount = db.Column(db.Float, nullable=False)
    
    # Split Payment Columns
    amount_cash = db.Column(db.Float, default=0.0)
    amount_mpesa = db.Column(db.Float, default=0.0)

    # Discount Columns
    discount_amount = db.Column(db.Float, default=0.0)
    coupon_code = db.Column(db.String(20), nullable=True)

    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='COMPLETED')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    cashier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    cashier = db.relationship('User', backref='sales', lazy=True)
    items = db.relationship('SaleItem', backref='parent_sale', cascade="all, delete-orphan", lazy=True)
    mpesa_details = db.relationship('MpesaPayment', backref='parent_sale', cascade="all, delete-orphan", uselist=False, lazy=True)


class SaleItem(db.Model):
    __tablename__ = 'transaction_items'
    __table_args__ = {'extend_existing': True} 

    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

class MpesaPayment(db.Model):
    __tablename__ = 'mpesa_payments'
    __table_args__ = {'extend_existing': True} 

    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=True)
    
    merchant_request_id = db.Column(db.String(100), unique=True, nullable=True)
    checkout_request_id = db.Column(db.String(100), unique=True, nullable=True)
    result_code = db.Column(db.Integer, nullable=True)
    result_desc = db.Column(db.String(255), nullable=True)
    mpesa_receipt_number = db.Column(db.String(50), nullable=True)
    phone_number = db.Column(db.String(15), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
