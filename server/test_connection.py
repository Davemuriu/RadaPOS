import os
import sys
from pathlib import Path

# Force fresh imports
BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))

# Clear any imports
if 'app' in sys.modules:
    del sys.modules['app']
if 'app.models' in sys.modules:
    del sys.modules['app.models']
if 'app.models.user' in sys.modules:
    del sys.modules['app.models.user']

from app import create_app
from app.extensions import db
from app.models.user import User
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("🔍 Testing Flask connection to database...")
    
    # 1. Check if we can access phone column directly
    try:
        result = db.session.execute(text("SELECT phone FROM users WHERE email='admin@radapos.com'"))
        phone = result.fetchone()[0]
        print(f"✅ Direct SQL phone query: {phone}")
    except Exception as e:
        print(f"❌ Direct SQL failed: {e}")
    
    # 2. Check ORM
    try:
        user = User.query.filter_by(email='admin@radapos.com').first()
        if user:
            print(f"✅ ORM query: {user.name}, Phone: {user.phone}")
        else:
            print("❌ ORM: User not found")
    except Exception as e:
        print(f"❌ ORM query failed: {e}")
        import traceback
        traceback.print_exc()
    
    # 3. Check model columns
    print(f"📋 User model columns: {[c.name for c in User.__table__.columns]}")
