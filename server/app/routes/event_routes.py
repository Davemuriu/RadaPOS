from flask import Blueprint, request, jsonify
from app import db
from app.models.event import Event

event_bp = Blueprint('event_bp', __name__)

# READ: Get all events
@event_bp.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        "id": e.id, 
        "name": e.name, 
        "location": e.location, 
        "status": e.status
    } for e in events]), 200

# CREATE: Add a new event
@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    new_event = Event(
        name=data.get('name'), 
        location=data.get('location'),
        status='active'
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"message": "Event created successfully!"}), 201

# UPDATE: Deactivate an event (PATCH)
@event_bp.route('/events/<int:id>', methods=['PATCH'])
def update_event(id):
    event = Event.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        event.status = data['status']
    db.session.commit()
    return jsonify({"message": f"Event {id} updated to {event.status}"}), 200