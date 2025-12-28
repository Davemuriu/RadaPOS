from flask import Flask, jsonify, request
from flask_cors import CORS # This is the critical security fix

app = Flask(__name__)
CORS(app) # This tells Flask to allow your React app to access data

# --- THE DATA YOUR FRONTEND IS EXPECTING ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Matches the stats state in React
    return jsonify({
        "total_revenue": 2500000,
        "platform_commission": 250000,
        "active_events": 4,
        "total_vendors": 32,
        "pending_withdrawals": 8
    })

@app.route('/api/events', methods=['GET'])
def get_events():
    # Matches the events state in React
    return jsonify([
        {"id": 1, "name": "SOLFEST 2025", "location": "Nairobi", "revenue": 1200000, "vendor_count": 12, "status": "active"},
        {"id": 2, "name": "Blankets & Wine", "location": "Laureat Garden", "revenue": 850000, "vendor_count": 18, "status": "active"}
    ])

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    # Matches the Admin Users table
    return jsonify([
        {"id": 1, "username": "David Muriu", "email": "david@radapos.com", "role": "super_admin"},
        {"id": 2, "username": "Jane Staff", "email": "jane@radapos.com", "role": "admin_manager"}
    ])

@app.route('/api/admin/withdrawals', methods=['GET'])
def get_withdrawals():
    # Matches the Financial Pipeline table
    return jsonify([
        {"id": 1, "vendor_name": "Urban Burger", "amount": 45000, "status": "pending"},
        {"id": 2, "vendor_name": "Artcaffe", "amount": 120000, "status": "approved"}
    ])

if __name__ == '__main__':
    app.run(port=5555, debug=True)