from app import create_app, db
from app.models.user import User

# import your existing Transaction model
from app.models.transaction import Transaction  # make sure the path matches your project

from app.utils.security import hash_password
from datetime import datetime

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    print("Tables created successfully!")

    # Seed admin user
    admin_email = "admin@radapos.com"
    admin_password = "Admin123"

    if not User.query.filter_by(email=admin_email).first():
        admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created!")
    else:
        print("Admin user already exists.")

    # Add a sample transaction if none exists
    admin_user = User.query.filter_by(email=admin_email).first()
    if admin_user and not Transaction.query.filter_by(user_id=admin_user.id).first():
        sample_tx = Transaction(
            user_id=admin_user.id,
            amount=1000
        )
        db.session.add(sample_tx)
        db.session.commit()
        print("Sample transaction added!")
    else:
        print("Sample transaction already exists.")
