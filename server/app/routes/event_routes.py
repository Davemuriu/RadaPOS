from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.utils.decorators import admin_role_required
from app.models.event import Event
from app.constants.enums import AdminRoles

event_bp = Blueprint("events", __name__)

@event_bp.get("")
def list_events():
    events = Event.query.filter_by(archived=False).order_by(Event.created_at.desc()).all()
    return jsonify([e.to_dict() for e in events]), 200


@event_bp.post("")
@admin_role_required(AdminRoles.MANAGER, AdminRoles.ADMINISTRATOR)
def create_event():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "Event name is required"}), 400

    event = Event(
        name=name,
        location=data.get("location"),
        is_active=True,
        archived=False,
        created_by=int(get_jwt_identity())
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201
