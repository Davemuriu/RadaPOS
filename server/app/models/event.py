from app import db
from datetime import datetime

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)


    transactions = db.relationship('Sale', backref='event', lazy=True)
    
    event_vendors = db.relationship('EventVendor', backref='event', lazy=True)

class EventVendor(db.Model):
    __tablename__ = 'event_vendors'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=False)
    booth_number = db.Column(db.String(20))
    status = db.Column(db.String(20), default='approved')

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    # ADD THIS LINE BELOW
    status = db.Column(db.String(20), default='active')