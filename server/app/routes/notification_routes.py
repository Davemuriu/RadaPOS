from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.extensions import db

notification_bp = Blueprint('notification_bp', __name__)

# GET ALL NOTIFICATIONS
@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = get_jwt_identity()
        notifs = Notification.query.filter_by(user_id=user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(50)\
            .all()
        
        return jsonify([{
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        } for n in notifs]), 200
    except Exception as e:
        print(f"Notification Error: {e}")
        return jsonify([]), 200 

# MARK SINGLE AS READ
@notification_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(id):
    user_id = get_jwt_identity()
    notification = Notification.query.get_or_404(id)

    if int(notification.user_id) != int(user_id):
        return jsonify({"msg": "Unauthorized access to this notification"}), 403

    notification.is_read = True
    db.session.commit()
    
    return jsonify({"msg": "Marked as read"}), 200

# MARK ALL AS READ
@notification_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    try:
        Notification.query.filter_by(user_id=user_id, is_read=False).update({Notification.is_read: True})
        db.session.commit()
        return jsonify({"msg": "All marked as read"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500