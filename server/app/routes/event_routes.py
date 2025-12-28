from flask import Blueprint, request, jsonify
from app import db
from app.models.event import Event # Ensure this model file exists!

event_bp = Blueprint('event_bp', __name__)

@event_bp.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{"id": e.id, "name": e.name, "location": e.location} for e in events])

@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    new_event = Event(name=data.get('name'), location=data.get('location'))
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"message": "Event created!"}), 201