from datetime import datetime
from app.extensions import db

# 1. Association Table (Links Events <-> Vendors)
event_vendors = db.Table('event_vendors',
    db.Column('event_id', db.Integer, db.ForeignKey('events.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    location = db.Column(db.String(160), nullable=True)
    starts_at = db.Column(db.DateTime, nullable=True)
    ends_at = db.Column(db.DateTime, nullable=True)
    
    is_active = db.Column(db.Boolean, default=True, index=True)
    archived = db.Column(db.Boolean, default=False, index=True)
    
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 2. Relationship: Access vendors via event.vendors
    vendors = db.relationship('User', secondary=event_vendors, backref=db.backref('assigned_events', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "starts_at": self.starts_at.isoformat() if self.starts_at else None,
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "is_active": self.is_active,
            "archived": self.archived,
            "vendors_count": len(self.vendors),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }