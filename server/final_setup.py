import os
from pathlib import Path

# Get the EXACT same path Flask will use
BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "radapos.db"

print(f"📁 Will create database at: {DB_PATH}")

# Now use Flask's actual app to create database
from app import create_app
from app.extensions import db
from app.models.user import User
import bcrypt

app = create_app()

with app.app_context():
    print(f"🔍 Flask database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Create all tables
    db.create_all()
    print("✅ Tables created")
    
    # Create admin
    admin = User(
        name='Admin User',
        email='admin@radapos.com',
        role='ADMIN',
        phone='+254700000001',
        address='Nairobi, Kenya'
    )
    admin.set_password('admin123')
    db.session.add(admin)
    
    db.session.commit()
    
    print("✅ Admin created: admin@radapos.com / admin123")
    
    # Verify
    user_count = User.query.count()
    print(f"📊 Total users: {user_count}")
    
    print(f"\n📁 Database file exists: {DB_PATH.exists()}")
    print(f"📁 Database size: {DB_PATH.stat().st_size if DB_PATH.exists() else 0} bytes")
