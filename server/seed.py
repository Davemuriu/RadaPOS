# seed.py
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package

app = create_app()

with app.app_context():
    print("🌱 Seeding database...")

    # DEV ONLY: resets tables
    db.drop_all()
    db.create_all()

    # --- Admin roles ---
    admin = User(
        name="Platform Administrator",
        email="admin@radapos.com",
        role="admin",
        admin_role="administrator",
        is_active=True,
    )
    admin.set_password("admin123")

    manager = User(
        name="Platform Manager",
        email="manager@radapos.com",
        role="admin",
        admin_role="manager",
        is_active=True,
    )
    manager.set_password("manager123")

    accountant = User(
        name="Platform Accountant",
        email="accountant@radapos.com",
        role="admin",
        admin_role="accountant",
        is_active=True,
    )
    accountant.set_password("accountant123")

    db.session.add_all([admin, manager, accountant])
    db.session.commit()

    # --- Package (approved) ---
    pkg = Package(
        name="Silver",
        description="Basic tier",
        price=1000,
        currency="KES",
        commission_percent=2.50,
        status="APPROVED",
        created_by=accountant.id,
        approved_by=admin.id,
    )
    db.session.add(pkg)
    db.session.commit()

    # --- Vendor user + vendor profile ---
    vendor_user = User(
        name="Demo Vendor",
        email="vendor@radapos.com",
        role="vendor",
        is_active=True,
    )
    vendor_user.set_password("vendor123")
    db.session.add(vendor_user)
    db.session.commit()

    vendor = Vendor(
        business_name="Demo Foods",
        phone="0700000000",
        kra_pin="A000000000Z",
        package_id=pkg.id,
        status="APPROVED",
        owner_id=vendor_user.id,
        submitted_by=manager.id,
        approved_by=admin.id,
    )
    db.session.add(vendor)
    db.session.commit()

    print("✅ Done seeding.")
