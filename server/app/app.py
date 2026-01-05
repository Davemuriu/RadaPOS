from flask import Flask, jsonify, request
from flask_cors import CORS # Run: pip install flask-cors
from flask import Flask
from server.app.config import Config

app = Flask(__name__)
app.config.from_object(Config)


app = Flask(__name__)

# FIX: Allow React (port 5173) to talk to Flask (port 5555)
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5173"}})

# --- MOCK DATA FOR DEMO ---
mock_events = [
    {"id": 1, "name": "Solfest 2025", "date": "2025-12-20", "status": "active"},
    {"id": 2, "name": "Nairobi Tech Week", "date": "2025-11-15", "status": "pending"}
]

# --- ROUTES (Must match React API_BASE) ---

@app.route('/api/events', methods=['GET'])
def get_events():
    return jsonify(mock_events)

@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    # Matches the stats state in your React code
    return jsonify({
        "total_revenue": 1500000,
        "platform_commission": 225000,
        "active_events": 5,
        "total_vendors": 42,
        "pending_withdrawals": 8
    })

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    return jsonify([
        {"username": "David Muriu", "email": "david@radapos.com", "role": "super_admin"},
        {"username": "Jane Doe", "email": "jane@radapos.com", "role": "admin_manager"}
    ])

@app.route('/api/admin/withdrawals', methods=['GET'])
def get_withdrawals():
    return jsonify([
        {"vendor_name": "Mama Mboga", "amount": 50000, "status": "pending"},
        {"vendor_name": "Urban Grill", "amount": 120000, "status": "approved"}
    ])

if __name__ == '__main__':
    # Ensure port matches React API_BASE
    app.run(debug=True, port=5555)