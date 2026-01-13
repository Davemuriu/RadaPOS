from app import create_app, db, bcrypt
from app.models.user import User
# Import other models to ensure SQL Alchemy knows about them when creating tables
from app.models.product import Product 
from app.models.transaction import Sale 

app = create_app()

with app.app_context():
    print("-----------------------------------")
    print("🗑️  DELETING OLD DATABASE...")
    print("-----------------------------------")
    
    # This wipes every single table and resets all ID counters to 1
    db.drop_all()
    
    print("✨ Creating fresh tables...")
    db.create_all()
    print("✅ Tables created successfully.")

    print("-----------------------------------")
    print("🌱 SEEDING ADMIN ACCOUNT...")
    print("-----------------------------------")

    # Create the ONE Admin user
    admin = User(
        name="System Admin",
        email="admin@radapos.com",
        password=bcrypt.generate_password_hash("admin123").decode('utf-8'),
        role="ADMIN", # Use uppercase if your auth check expects it
        status="active",
        wallet_balance=0.0
    )

    db.session.add(admin)
    db.session.commit()

    print("✅ Admin Created: admin@radapos.com / admin123")
    print("🚀 SYSTEM RESET COMPLETE: No products, No vendors, Sales count reset.")