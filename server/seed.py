from app import create_app, db
from datetime import datetime

# IMPORTS
from app.models.event import Event, EventVendor
from app.models.product import Product
from app.models.user import User, Vendor
from app.models.wallet import Wallet  # <--- Added Wallet
from app.models.transaction import Sale

app = create_app()

with app.app_context():
    print("🌱 Starting Database Seed...")

    
    # 1. Create User & Vendor (The Seller)
    
    vendor_email = "vendor@test.com"
    user = User.query.filter_by(email=vendor_email).first()
    
    if not user:
        print(f"👤 Creating dummy vendor: {vendor_email}")
        user = User(
            email=vendor_email,
            password="password123", # Plain text triggers the @password.setter
            role="vendor"
        )
        db.session.add(user)
        db.session.commit()

        # Create Profile
        vendor_profile = Vendor(user_id=user.id, business_name="Tusker Bar")
        db.session.add(vendor_profile)
        db.session.commit()
        print(f"   ✅ Vendor Profile Created (ID: {vendor_profile.id})")
    else:
        print(f"   ℹ️ Vendor already exists (ID: {user.id})")
        vendor_profile = Vendor.query.filter_by(user_id=user.id).first()

    
    # 2. Create Wallet (The Money Bag) - NEW!
    
    wallet = Wallet.query.filter_by(vendor_id=vendor_profile.id).first()
    if not wallet:
        print("💰 Creating Vendor Wallet")
        wallet = Wallet(
            vendor_id=vendor_profile.id,
            current_balance=0.0
        )
        db.session.add(wallet)
        db.session.commit()
        print("   ✅ Wallet Created")
    else:
        print("   ℹ️ Wallet already exists")

    
    # 3. Create Event (The Concert)
    event = Event.query.get(1)
    if not event:
        print("🎉 Creating Dummy Event: Solfest")
        event = Event(
            id=1,
            name="Solfest Test",
            location="Nairobi Gardens",
            start_date=datetime.utcnow(), 
            end_date=datetime.utcnow(),   
            is_active=True
        )
        db.session.add(event)
        db.session.commit()
        print("   ✅ Event Created")
    else:
        print("   ℹ️ Event ID 1 already exists")

    
    # 4. Link Vendor to Event
    event_vendor = EventVendor.query.filter_by(event_id=1, vendor_id=vendor_profile.id).first()
    if not event_vendor:
        print("🎪 Assigning Vendor to Event Booth")
        ev = EventVendor(
            event_id=1,
            vendor_id=vendor_profile.id,
            booth_number="B-01",
            status="approved"
        )
        db.session.add(ev)
        db.session.commit()
        print("   ✅ Vendor linked to Event")

    
    # 5. Create Product (The Beer)
    product = Product.query.get(100)
    if not product:
        print("🍺 Creating Dummy Product: Tusker Cider")
        product = Product(
            id=100,
            name="Tusker Cider",
            price=250.0,
            stock_quantity=50,
            vendor_id=vendor_profile.id,
        )
        db.session.add(product)
        db.session.commit()
        print("   ✅ Product Created")
    else:
        print("   ℹ️ Product ID 100 already exists")

    print("\n🚀 SEEDING COMPLETE!")
    print(f"👉 Use Event ID: 1")
    print(f"👉 Use Product ID: 100")
    print(f"👉 Vendor Login: {vendor_email} / password123")