from app import create_app, db
from app.models.user import User
from app.models.event import Event
from app.models.transaction import Transaction
from datetime import datetime

app = create_app()

def seed_data():
    with app.app_context():
        print("Cleaning database...")
        db.drop_all()
        db.create_all()

        print("Seeding RBAC Admin Accounts...")
        # Super Admin: Full Access
        super_admin = User(username="David_Super", email="david@radapos.com", role="super_admin", status="active")
        super_admin.set_password("admin123")
        
        # Admin Manager: Event/Vendor Focus
        manager = User(username="Jane_Manager", email="jane@radapos.com", role="admin_manager", status="active")
        manager.set_password("admin123")
        
        # Admin Accountant: Payouts & Methods
        accountant = User(username="Mark_Accountant", email="mark@radapos.com", role="admin_accountant", status="active")
        accountant.set_password("admin123")
        
        # Admin Viewer: Reports Only
        viewer = User(username="Lucy_Viewer", email="lucy@radapos.com", role="admin_viewer", status="active")
        viewer.set_password("admin123")

        db.session.add_all([super_admin, manager, accountant, viewer])

        print("Seeding Vendors & Events...")
        # Create a few real-world vendors
        v1 = User(username="Jambo Grill", email="contact@jambo.com", role="vendor", status="active")
        v2 = User(username="Cool Drinks", email="info@cool.com", role="vendor", status="active")
        db.session.add_all([v1, v2])
        db.session.commit()

        # Create Active Event
        event = Event(
            name="Solfest 2025", 
            location="Nairobi", 
            status="active", 
            revenue=12400000, 
            vendor_count=45
        )
        db.session.add(event)

        print("Seeding Withdrawal Requests...")
        # Payout requests for the Accountant/Super Admin flow
        w1 = Transaction(vendor_name="Jambo Grill", amount=145000, type="withdrawal", status="pending")
        w2 = Transaction(vendor_name="Cool Drinks", amount=98500, type="withdrawal", status="approved")
        db.session.add_all([w1, w2])

        db.session.commit()
        print("Database seeded successfully with RBAC logic!")

if __name__ == "__main__":
    seed_data()