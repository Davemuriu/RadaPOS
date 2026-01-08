# init_db.py
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.product import Product
from app.models.transaction import Transaction
import bcrypt
from datetime import datetime, timedelta
import random

app = create_app()

with app.app_context():
    print(" Starting database setup...")
    
    # Create all tables
    db.create_all()
    print(" Tables created successfully!")
    
    # Check if admin already exists
    admin_exists = User.query.filter_by(email='admin@radapos.com').first()
    
    if not admin_exists:
        print(" Creating default users...")
        
        # Create admin
        admin = User(
            name='System Admin',
            email='admin@radapos.com',
            role='ADMIN',
            phone='+254700000001'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        print("    Admin: admin@radapos.com / admin123")
        
        # Create manager
        manager = User(
            name='Store Manager',
            email='manager@radapos.com',
            role='MANAGER',
            phone='+254700000002'
        )
        manager.set_password('manager123')
        db.session.add(manager)
        print("    Manager: manager@radapos.com / manager123")
        
        # Create cashier
        cashier = User(
            name='John Cashier',
            email='cashier@radapos.com',
            role='CASHIER',
            phone='+254700000003'
        )
        cashier.set_password('cashier123')
        db.session.add(cashier)
        print("    Cashier: cashier@radapos.com / cashier123")
        
        # Create vendors
        vendors_data = [
            {
                'name': 'Fresh Dairy Co.',
                'email': 'freshdairy@example.com',
                'business_name': 'Fresh Dairy Company',
                'business_type': 'Dairy Products',
                'phone': '+254700000004'
            },
            {
                'name': 'Bakery King Ltd',
                'email': 'bakeryking@example.com',
                'business_name': 'Bakery King Limited',
                'business_type': 'Bakery',
                'phone': '+254700000005'
            }
        ]
        
        for i, vendor_data in enumerate(vendors_data):
            vendor = User(
                name=vendor_data['name'],
                email=vendor_data['email'],
                role='VENDOR',
                phone=vendor_data['phone'],
                business_name=vendor_data['business_name'],
                business_type=vendor_data['business_type']
            )
            vendor.set_password(f'vendor{i+1}123')
            db.session.add(vendor)
            print(f"    Vendor {i+1}: {vendor_data['email']} / vendor{i+1}123")
        
        # Create sample products
        print("\n Creating sample products...")
        
        # Get vendor IDs
        vendor1 = User.query.filter_by(email='freshdairy@example.com').first()
        vendor2 = User.query.filter_by(email='bakeryking@example.com').first()
        
        products_data = [
            {
                'name': 'Milk 1L',
                'description': 'Fresh pasteurized milk 1 liter',
                'price': 120.0,
                'stock_quantity': 50,
                'category': 'Dairy',
                'barcode': '5901234123457',
                'vendor_id': vendor1.id
            },
            {
                'name': 'Yoghurt 500ml',
                'description': 'Natural yoghurt 500ml',
                'price': 85.0,
                'stock_quantity': 30,
                'category': 'Dairy',
                'barcode': '5901234123458',
                'vendor_id': vendor1.id
            },
            {
                'name': 'White Bread Loaf',
                'description': 'Fresh white bread 400g',
                'price': 60.0,
                'stock_quantity': 40,
                'category': 'Bakery',
                'barcode': '5901234123460',
                'vendor_id': vendor2.id
            },
            {
                'name': 'Whole Wheat Bread',
                'description': 'Whole wheat bread 400g',
                'price': 75.0,
                'stock_quantity': 25,
                'category': 'Bakery',
                'barcode': '5901234123461',
                'vendor_id': vendor2.id
            }
        ]
        
        for product_data in products_data:
            product = Product(
                name=product_data['name'],
                description=product_data['description'],
                price=product_data['price'],
                stock_quantity=product_data['stock_quantity'],
                category=product_data['category'],
                barcode=product_data['barcode'],
                vendor_id=product_data['vendor_id']
            )
            db.session.add(product)
            print(f"    {product.name} - KES {product.price}")
        
        # Create sample transactions
        print("\n Creating sample transactions...")
        for i in range(10):
            transaction = Transaction(
                amount=random.uniform(100, 3000),
                user_id=cashier.id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 7))
            )
            db.session.add(transaction)
        
        print("  10 sample transactions created")
        
        # Commit everything
        db.session.commit()
        print("\n Database initialized successfully!")
        
    else:
        print("  Database already initialized. Skipping sample data creation.")
    
    print("\n Login Credentials:")
    print("Admin: admin@radapos.com / admin123")
    print("Manager: manager@radapos.com / manager123")
    print("Cashier: cashier@radapos.com / cashier123")
    print("Vendor 1: freshdairy@example.com / vendor1123")
    print("Vendor 2: bakeryking@example.com / vendor2123")
    print("\n Start the server with: python3 run.py")