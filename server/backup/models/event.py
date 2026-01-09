# app/models/event.py - FIXED VERSION
from app.extensions import db
from datetime import datetime

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to EventVendor (junction table)
    event_vendors = db.relationship('EventVendor', backref='event', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'vendors': [ev.to_dict() for ev in self.event_vendors]
        }

class EventVendor(db.Model):
    __tablename__ = 'event_vendors'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # CHANGED: users.id NOT vendors.id
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to User (vendor)
    vendor = db.relationship('User', backref='event_participations')
    
    def to_dict(self):
        from .user import User
        vendor = User.query.get(self.vendor_id)
        return {
            'id': self.id,
            'event_id': self.event_id,
            'vendor_id': self.vendor_id,
            'vendor_name': vendor.name if vendor else None,
            'vendor_business': vendor.business_name if vendor and vendor.role == 'VENDOR' else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }