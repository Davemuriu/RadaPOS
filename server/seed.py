# seed.py
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.payout import Payout
from app.models.package import Package
from app.constants.enums import Roles, AdminRoles, ApprovalStatus

app = create_app()

with app.app_context():
    print("🌱 Seeding database...")

    db.drop_all()
    db.create_all()

    # Administrator
    admin = User(name="Platform Administrator", email="admin@radapos.com",
                 role=Roles.ADMIN, admin_role=AdminRoles.ADMINISTRATOR)
    admin.set_password("admin123")

    # Manager
    manager = User(name="Platform Manager", email="manager@radapos.com",
                   role=Roles.ADMIN, admin_role=AdminRoles.MANAGER)
    manager.set_password("manager123")

    # Accountant
    accountant = User(name="Platform Accountant", email="accountant@radapos.com",
                      role=Roles.ADMIN, admin_role=AdminRoles.ACCOUNTANT)
    accountant.set_password("accountant123")

    # Sample vendor owner
    vendor_user = User(name="Demo Vendor", email="vendor@radapos.com", role=Roles.VENDOR)
    vendor_user.set_password("vendor123")

    vendor = Vendor(
        business_name="Demo Foods",
        phone="0700000000",
        kra_pin="A000000000Z",
        status=ApprovalStatus.DRAFT,
        owner=vendor_user
    )

    # Sample payout request (draft)
    payout = Payout(vendor_id=1, amount=2500, status=ApprovalStatus.DRAFT, created_by=None)

    # Sample package (draft)
    pkg = Package(name="Silver", description="Basic tier", price=1000, currency="KES",
                  status=ApprovalStatus.DRAFT, created_by=None)

    db.session.add_all([admin, manager, accountant, vendor_user, vendor, payout, pkg])
    db.session.commit()

    print("✅ Done seeding.")
