# app/routes/event_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.event import Event, EventVendor
from app.extensions import db
from app.utils.rbac import role_required

event_bp = Blueprint("event", __name__)

# Get all events
@event_bp.route("/", methods=["GET"])
@jwt_required()
def get_events():
    events = Event.query.all()
    return jsonify([{
        "id": e.id,
        "name": e.name,
        "date": e.date.isoformat() if e.date else None,
        "location": e.location
    } for e in events]), 200

# Get single event
@event_bp.route("/<int:event_id>", methods=["GET"])
@jwt_required()
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return {
        "id": event.id,
        "name": event.name,
        "date": event.date.isoformat() if event.date else None,
        "location": event.location
    }, 200

# Create event (ADMIN only)
@event_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def create_event():
    data = request.get_json()
    event = Event(
        name=data["name"],
        date=data.get("date"),
        location=data.get("location")
    )
    db.session.add(event)
    db.session.commit()
    return {"msg": "Event created", "event_id": event.id}, 201

# Update event (ADMIN only)
@event_bp.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
@role_required("ADMIN")
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    event.name = data.get("name", event.name)
    event.date = data.get("date", event.date)
    event.location = data.get("location", event.location)
    db.session.commit()
    return {"msg": "Event updated"}, 200

# Delete event (ADMIN only)
@event_bp.route("/<int:event_id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return {"msg": "Event deleted"}, 200
