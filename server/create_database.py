# working_server_fixed.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import timedelta

app = Flask(__name__)

# FIXED SECRETS - Never change these!
app.config['SECRET_KEY'] = 'super-secret-permanent-key-123'
app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-permanent-key-123'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_CSRF_CHECK_FORM'] = False

CORS(app, supports_credentials=True)
jwt = JWTManager(app)

# In-memory user
USERS = {
    'admin@radapos.com': {
        'id': '1',
        'name': 'Admin',
        'role': 'ADMIN',
        'password_hash': bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
    }
}

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = USERS.get(data.get('email'))
    
    if user and bcrypt.checkpw(data.get('password', '').encode('utf-8'), user['password_hash'].encode('utf-8')):
        token = create_access_token(identity=str(user['id']))
        return jsonify({
            'access_token': token,
            'user': {'id': user['id'], 'name': user['name'], 'role': user['role']}
        })
    
    return jsonify({'msg': 'Invalid credentials'}), 401

@app.route('/transactions/summary', methods=['GET'])
@jwt_required()
def summary():
    user_id = get_jwt_identity()
    return jsonify({
        'user_id': user_id,
        'total_amount': 12500.50,
        'transaction_count': 42,
        'daily_sales': [
            {'date': '2024-01-01', 'amount': 1200},
            {'date': '2024-01-02', 'amount': 1800},
            {'date': '2024-01-03', 'amount': 2100},
            {'date': '2024-01-04', 'amount': 1950},
            {'date': '2024-01-05', 'amount': 2300},
            {'date': '2024-01-06', 'amount': 1650},
            {'date': '2024-01-07', 'amount': 2500}
        ]
    })

@app.route('/products', methods=['GET'])
@jwt_required()
def products():
    return jsonify({
        'products': [
            {'id': 1, 'name': 'Milk 1L', 'price': 120, 'vendor_name': 'Fresh Dairy'},
            {'id': 2, 'name': 'Bread', 'price': 60, 'vendor_name': 'Bakery King'},
            {'id': 3, 'name': 'Sugar 1kg', 'price': 150, 'vendor_name': 'Super Produce'},
        ]
    })

if __name__ == '__main__':
    print(" PERMANENT SERVER on http://127.0.0.1:5555")
    print(" Login: admin@radapos.com / admin123")
    print(" Using FIXED JWT secrets (tokens won't expire on restart)")
    app.run(host='127.0.0.1', port=5555, debug=True)