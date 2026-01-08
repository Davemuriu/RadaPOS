import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = f'{BASE_DIR}/radapos.db'

print(f"📁 Creating database at: {DB_PATH}")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# SIMPLE models without any bad references
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    price = db.Column(db.Float)
    vendor_id = db.Column(db.Integer, db.ForeignKey('users.id'))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    print("🚀 Creating clean database...")
    
    # This should work now
    db.create_all()
    print("✅ Tables created: users, products, transactions")
    
    # Create admin
    admin = User(
        name='Admin User',
        email='admin@radapos.com',
        role='ADMIN',
        phone='+254700000001'
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    
    print("✅ Admin created: admin@radapos.com / admin123")
    print(f"📊 Database size: {os.path.getsize(DB_PATH)} bytes")
