from app.extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(20), default='info') 
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

  
    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "time": self.created_at.strftime("%H:%M") 
        }