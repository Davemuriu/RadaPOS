from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from datetime import datetime, timedelta
import jwt

app = Flask(__name__)

# --- CONFIG ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///radapos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'rada_pos_2026_secret'
app.config['DEV_MODE'] = True 

db = SQLAlchemy(app)

# Explicitly allow the headers your React app is sending
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "X-User-Role"]
}})

# --- MODELS ---
class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)
    role = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')

# --- REFACTORED SECURITY CHECK ---
# We move the check inside the function to avoid blocking OPTIONS requests
def check_admin_role():
    user_role = request.headers.get('X-User-Role')
    if not user_role or user_role != 'Administrator':
        return False
    return True

# --- ROUTES ---

@app.route('/api/admin/db-init', methods=['POST'])
def initialize_db():
    db.create_all()
    if not AdminUser.query.filter_by(email='admin@radapos.com').first():
        admin = AdminUser(name="Main Admin", email="admin@radapos.com", role="Administrator", status="active")
        db.session.add(admin)
        db.session.commit()
    return jsonify({"message": "Database Initialized"}), 201

@app.route('/api/admin/users', methods=['GET', 'POST', 'OPTIONS'])
def handle_users():
    # 1. ALWAYS handle OPTIONS first for CORS
    if request.method == 'OPTIONS':
        return make_response('', 200)

    # 2. MANUALLY check role here to avoid 405/Decorator issues
    if not check_admin_role():
        return jsonify({"error": "Unauthorized. Administrator role required."}), 401

    # 3. Handle GET request (Fetch Users)
    if request.method == 'GET':
        users = AdminUser.query.all()
        return jsonify([{"id":u.id, "name":u.name, "email":u.email, "role":u.role, "status":u.status} for u in users])
    
    # 4. Handle POST request (Create/Invite User)
    if request.method == 'POST':
        data = request.json
        if not data or 'email' not in data:
            return jsonify({"message": "Invalid data"}), 400
            
        if AdminUser.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already exists"}), 400

        new_user = AdminUser(
            name=data['name'], 
            email=data['email'], 
            role=data['role'], 
            status='pending'
        )
        db.session.add(new_user)
        db.session.commit()

        token = jwt.encode({
            'sub': data['email'], 
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Link for your terminal
        invite_link = f"http://localhost:5173/setup-password?token={token}"
        print(f"\n--- INVITE GENERATED ---\nUser: {data['email']}\nLink: {invite_link}\n------------------------\n")
        
        return jsonify({"message": "Account created. Invite link generated in terminal."}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5555)