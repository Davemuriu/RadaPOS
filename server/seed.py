import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

from app import create_app, db, bcrypt
from app.models.product import Product
from app.models.user import User

app = create_app()

with app.app_context():
    print(f"🔌 Connecting to: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    print("🧹 Wiping Database (Force Cascade)...")
    try:
        db.session.execute(text('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres;'))
        db.session.commit()
    except Exception as e:
        print(f"   - Wipe warning: {e}")
        db.session.rollback()
    
    db.create_all()
    print("✨ Tables Recreated.")

    # 1. Create ADMIN
    admin_pass = bcrypt.generate_password_hash("admin123").decode('utf-8')
    admin = User(
        email="admin@radapos.com", 
        password=admin_pass, 
        role="ADMIN",
        name="System Administrator",
        phone_number="0700000000"
    )
    db.session.add(admin)

    # 2. Create VENDOR
    vendor_pass = bcrypt.generate_password_hash("password123").decode('utf-8')
    vendor = User(
        email="vendor@test.com", 
        password=vendor_pass, 
        role="VENDOR",
        name="David Muriu",
        phone_number="0712345678",
        id_number="12345678",
        business_name="Muriu Wines & Spirits",
        withdrawal_mpesa_number="0712345678"
    )
    db.session.add(vendor)

    # 3. Create CASHIER
    cashier_pass = bcrypt.generate_password_hash("cashier123").decode('utf-8')
    cashier = User(
        email="cashier@test.com", 
        password=cashier_pass, 
        role="CASHIER",
        name="John Cashier",
        phone_number="0722334455",
        id_number="87654321"
    )
    db.session.add(cashier)
    
    db.session.commit()
    print("👤 Created Users: Admin, Vendor, Cashier")

    # 4. Create Products
    products_data = [
        {"name": "Tusker Lager", "price": 300, "stock": 50},
        {"name": "White Cap", "price": 350, "stock": 40},
        {"name": "Tusker Cider", "price": 250, "stock": 100},
        {"name": "Soda (Coke)", "price": 100, "stock": 200},
        {"name": "Water (500ml)", "price": 50, "stock": 24}
    ]

    for p in products_data:
        prod = Product(
            name=p["name"],
            price=p["price"],
            stock_quantity=p["stock"],
            vendor_id=vendor.id,
            description="Event beverage"
        )
        db.session.add(prod)
    
    db.session.commit()
    print(f"🍺 Added {len(products_data)} Products.")
    print("\n🚀 DATABASE UPDATE COMPLETE!")