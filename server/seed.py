# seed.py
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package


def get_or_create_user(*, name: str, email: str, role: str, admin_role: str | None = None, password: str | None = None):
    user = User.query.filter_by(email=email).first()
    if user:
        return user, False

    user = User(
        name=name,
        email=email,
        role=role,
        admin_role=admin_role,
        is_active=True,
    )
    if password:
        user.set_password(password)

    db.session.add(user)
    db.session.commit()
    return user, True


def get_or_create_package(*, name: str, created_by: int, approved_by: int):
    pkg = Package.query.filter_by(name=name).first()
    if pkg:
        return pkg, False

    pkg = Package(
        name=name,
        description="Basic tier",
        price=1000,
        currency="KES",
        commission_percent=2.50,
        status="APPROVED",
        created_by=created_by,
        approved_by=approved_by,
    )
    db.session.add(pkg)
    db.session.commit()
    return pkg, True


def get_or_create_vendor(*, business_name: str, owner_id: int, package_id: int, submitted_by: int, approved_by: int):
    vendor = Vendor.query.filter_by(owner_id=owner_id).first()
    if vendor:
        return vendor, False

    vendor = Vendor(
        business_name=business_name,
        phone="0700000000",
        kra_pin="A000000000Z",
        package_id=package_id,
        status="APPROVED",
        owner_id=owner_id,
        submitted_by=submitted_by,
        approved_by=approved_by,
    )
    db.session.add(vendor)
    db.session.commit()
    return vendor, True


app = create_app()

with app.app_context():
    print("🌱 Seeding database (safe mode)...")

    # ✅ 1) Create INITIAL SUPER ADMIN (Rebecca) if missing
    super_admin, created = get_or_create_user(
        name="Rebecca Vugutsa (Super Admin)",
        email="bekivugz@gmail.com",
        role="admin",
        admin_role="administrator",
        password="admin123",
    )
    print("✅ Super Admin:", super_admin.email, "(created)" if created else "(exists)")

    # ✅ 2) OPTIONAL: Create demo Manager + Accountant ONLY if you want demo data
    manager, m_created = get_or_create_user(
        name="Platform Manager",
        email="manager",
        role="admin",
        admin_role="manager",
        password="manager123",
    )
    accountant, a_created = get_or_create_user(
        name="Platform Accountant",
        email="accountant",
        role="admin",
        admin_role="accountant",
        password="accountant123",
    )
    print("✅ Manager:", manager.email, "(created)" if m_created else "(exists)")
    print("✅ Accountant:", accountant.email, "(created)" if a_created else "(exists)")

    # ✅ 3) OPTIONAL: Create a demo package + vendor (safe)
    pkg, p_created = get_or_create_package(
        name="Silver",
        created_by=accountant.id,
        approved_by=super_admin.id,
    )
    print("✅ Package:", pkg.name, "(created)" if p_created else "(exists)")

    vendor_user, vu_created = get_or_create_user(
        name="Demo Vendor",
        email="vendor",
        role="vendor",
        password="vendor123",
    )
    print("✅ Vendor user:", vendor_user.email, "(created)" if vu_created else "(exists)")

    vendor, v_created = get_or_create_vendor(
        business_name="Demo Foods",
        owner_id=vendor_user.id,
        package_id=pkg.id,
        submitted_by=manager.id,
        approved_by=super_admin.id,
    )
    print("✅ Vendor profile:", vendor.business_name, "(created)" if v_created else "(exists)")

    print("✅ Done seeding.")
