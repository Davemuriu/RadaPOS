from run import app, db
from werkzeug.security import generate_password_hash
from datetime import datetime

with app.app_context():
    # Drop all tables
    db.drop_all()
    
    # Create all tables
    db.create_all()
    
    # Create test vendor
    from models.user import User
    vendor = User(
        name='Test Vendor',
        email='vendor@example.com',
        password=generate_password_hash('password123'),
        role='vendor',
        created_at=datetime.utcnow()
    )
    db.session.add(vendor)
    
    # Create test products
    from models.product import Product
    products = [
        Product(
            name='Wireless Headphones',
            description='Noise cancelling wireless headphones',
            price=79.99,
            category='Electronics',
            stock_quantity=15,
            vendor_id=1
        ),
        Product(
            name='Cotton T-Shirt',
            description='100% cotton t-shirt',
            price=19.99,
            category='Clothing',
            stock_quantity=45,
            vendor_id=1
        ),
        Product(
            name='Coffee Beans',
            description='Premium arabica coffee beans',
            price=12.50,
            category='Food & Beverage',
            stock_quantity=8,
            vendor_id=1
        ),
    ]
    
    for product in products:
        db.session.add(product)
    
    db.session.commit()
    
    print('✓ Database initialized successfully!')
    print('✓ Test vendor: vendor@example.com / password123')
    print('✓ 3 sample products created')