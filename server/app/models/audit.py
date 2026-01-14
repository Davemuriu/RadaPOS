from app.extensions import db
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100), nullable=False)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    details = db.Column(db.String(255), nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='actions_performed')
    
    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "user": self.user.name if self.user else "Unknown",
            "role": self.user.role if self.user else "Unknown",
            "details": self.details,
            "timestamp": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }