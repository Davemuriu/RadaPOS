from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import bcrypt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///radapos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='CASHIER')
    
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

# Create tables
with app.app_context():
    print("🚀 Creating database...")
    db.create_all()
    print("✅ Tables created: users, products, transactions")
    
    # Create admin user
    admin = User(name='Admin', email='admin@radapos.com', role='ADMIN')
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    print("✅ Admin created: admin@radapos.com / admin123")
    print("\n🎉 Database ready!")
