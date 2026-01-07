from app import db, create_app
from app.models import User  # make sure your User model is imported
from werkzeug.security import generate_password_hash
from datetime import datetime

# Initialize Flask app context
app = create_app()
with app.app_context():
    # Create all tables defined in SQLAlchemy models
    db.create_all()
    print("✅ All tables created successfully!")

    # Check if Admin user already exists
    admin_email = "admin@example.com"
    existing_admin = User.query.filter_by(email=admin_email).first()
    if not existing_admin:
        # Create default Admin user
        admin_user = User(
            email=admin_email,
            password_hash=generate_password_hash("Admin123"),
            role="admin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"✅ Admin user created: {admin_email} / Admin123")
    else:
        print("ℹ️ Admin user already exists, skipping creation.")
