from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app.models.user import User
from app.models.transaction import Sale
from app.models.wallet import Settlement, Wallet
from app.models.event import Event
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.extensions import db, bcrypt, mail
from sqlalchemy import func
import functools
from datetime import datetime, time, timedelta
import csv
import io
import string
import secrets

admin_bp = Blueprint('admin_bp', __name__)

def log_admin_action(user_id, action, details=""):
    try:
        log = AuditLog(user_id=user_id, action=action, details=details, ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Failed to create audit log: {e}")

def admin_required(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.upper() not in ['ADMIN', 'ADMINISTRATOR']:
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def send_credentials_email(user, password, role_name):
    try:
        msg = Message(f"RadaPOS {role_name} Access Credentials", recipients=[user.email])
        msg.body = f"""
        Hello {user.name},

        You have been registered as a {role_name} on RadaPOS.

        Your login details are:
        Email: {user.email}
        Temporary Password: {password}

        Please log in at your respective portal and change your password immediately.
        """
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email to {user.email}: {e}")
        return False

# STATS & GRAPHS
@admin_bp.route('/dashboard/graph', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_graph():
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    results = db.session.query(
        func.date(Sale.created_at).label('date'),
        func.sum(Sale.total_amount).label('total')
    ).filter(Sale.created_at >= start_date, Sale.status == 'COMPLETED')\
    .group_by(func.date(Sale.created_at)).all()
    
    data = [{"name": str(r.date), "sales": float(r.total)} for r in results]
    return jsonify(data), 200

@admin_bp.route('/reports/daily', methods=['GET'])
@jwt_required()
@admin_required
def get_daily_report():
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, time.min)
    end_of_day = datetime.combine(today, time.max)

    today_sales = db.session.query(func.sum(Sale.total_amount))\
        .filter(Sale.created_at >= start_of_day, Sale.created_at <= end_of_day)\
        .filter_by(status='COMPLETED').scalar() or 0.0
    
    return jsonify({
        "date": today.strftime("%Y-%m-%d"),
        "gross_sales": float(today_sales),
        "net_total": float(today_sales),
        "recent_exports": [] 
    }), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    total_collections = db.session.query(func.sum(Sale.total_amount)).filter_by(status='COMPLETED').scalar() or 0.0
    total_earnings = total_collections * 0.10
    total_vendors = User.query.filter(func.upper(User.role) == 'VENDOR').count()
    pending_withdrawals_count = Settlement.query.filter(
        Settlement.sale_id.is_(None), Settlement.status.in_(['processing', 'pending'])
    ).count()

    active_events_query = Event.query.filter_by(is_active=True, archived=False).limit(5).all()
    active_events_data = []
    for e in active_events_query:
        event_dict = e.to_dict()
        event_dict['vendors_count'] = len(e.vendors)
        active_events_data.append(event_dict)

    return jsonify({
        "total_collections": total_collections,
        "total_earnings": total_earnings,
        "total_vendors": total_vendors,
        "pending_withdrawals_count": pending_withdrawals_count,
        "active_events": active_events_data
    }), 200

# GLOBAL WALLET ROUTES
@admin_bp.route('/wallet/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_wallet_overview():
    total_revenue = db.session.query(func.sum(Sale.total_amount)).filter_by(status='COMPLETED').scalar() or 0.0
    platform_earnings = total_revenue * 0.10
    
    pending_withdrawals = db.session.query(func.sum(Settlement.amount))\
        .filter(Settlement.status.in_(['pending', 'processing'])).scalar() or 0.0
        
    return jsonify({
        "platform_earnings": float(platform_earnings),
        "total_revenue": float(total_revenue),
        "pending_withdrawals": float(pending_withdrawals)
    }), 200

@admin_bp.route('/wallet/withdrawals', methods=['GET'])
@jwt_required()
@admin_required
def get_all_withdrawals():
    # Corrected JOIN: Uses Settlement.vendor_id explicitly
    withdrawals = db.session.query(Settlement, User)\
        .join(User, Settlement.vendor_id == User.id)\
        .filter(Settlement.sale_id.is_(None))\
        .order_by(Settlement.created_at.desc()).all()
    
    output = []
    for w, u in withdrawals:
        output.append({
            "id": w.id,
            "vendor_name": u.business_name if u.business_name else u.name,
            "vendor_email": u.email,
            "amount": float(w.amount),
            "status": w.status,
            "mpesa_number": u.phone_number,
            "created_at": w.created_at.isoformat()
        })
    
    return jsonify(output), 200

@admin_bp.route('/wallet/withdrawals/<int:id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_withdrawal(id):
    try:
        withdrawal = Settlement.query.get_or_404(id)
        
        if withdrawal.status != 'pending':
            return jsonify({"msg": f"Withdrawal is already {withdrawal.status}"}), 400

        withdrawal.status = 'completed'
        withdrawal.processed_at = datetime.utcnow()
        
        # Notify Vendor
        notif = Notification(
            user_id=withdrawal.vendor_id, 
            message=f"Your withdrawal of KES {withdrawal.amount:,.2f} has been Approved and Processed.", 
            type="success"
        )
        db.session.add(notif)
        
        db.session.commit()
        
        log_admin_action(
            get_jwt_identity(), 
            "Approved Withdrawal", 
            f"ID: {id} | Amount: {withdrawal.amount}"
        )
        
        return jsonify({"msg": "Withdrawal approved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Approval failed", "error": str(e)}), 500

@admin_bp.route('/wallet/withdrawals/<int:id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_withdrawal(id):
    try:
        withdrawal = Settlement.query.get_or_404(id)
        
        if withdrawal.status != 'pending':
            return jsonify({"msg": "Only pending withdrawals can be rejected"}), 400

        # Refund Logic
        vendor_wallet = Wallet.query.filter_by(vendor_id=withdrawal.vendor_id).first()
        if vendor_wallet:
            vendor_wallet.current_balance += withdrawal.amount
        
        withdrawal.status = 'rejected'
        
        # Notify Vendor
        notif = Notification(
            user_id=withdrawal.vendor_id, 
            message=f"Your withdrawal of KES {withdrawal.amount:,.2f} was Rejected. Funds returned to wallet.", 
            type="error"
        )
        db.session.add(notif)
        
        db.session.commit()
        
        log_admin_action(
            get_jwt_identity(), 
            "Rejected Withdrawal", 
            f"ID: {id}"
        )
        
        return jsonify({"msg": "Withdrawal rejected and funds returned"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Rejection failed", "error": str(e)}), 500

# USER & EVENT MANAGEMENT
@admin_bp.route('/events', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def manage_events_root():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        events = Event.query.filter_by(archived=False).order_by(Event.created_at.desc()).all()
        return jsonify([e.to_dict() for e in events]), 200

    if request.method == 'POST':
        data = request.get_json()
        if not data.get('name'):
            return jsonify({"msg": "Event name is required"}), 400

        new_event = Event(
            name=data['name'],
            location=data.get('location'),
            starts_at=datetime.fromisoformat(data['starts_at'].replace('Z', '')) if data.get('starts_at') else None,
            ends_at=datetime.fromisoformat(data['ends_at'].replace('Z', '')) if data.get('ends_at') else None,
            created_by=user_id
        )
        db.session.add(new_event)
        db.session.commit()
        log_admin_action(user_id, "Created Event", f"Event: {new_event.name}")
        return jsonify({"msg": "Event created", "event": new_event.to_dict()}), 201

@admin_bp.route('/events/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_single_event(id):
    event = Event.query.get_or_404(id)
    if request.method == 'DELETE':
        event.archived = True
        db.session.commit()
        log_admin_action(get_jwt_identity(), "Archived Event", f"ID: {id}")
        return jsonify({"msg": "Event archived"}), 200

    if request.method == 'PUT':
        data = request.get_json()
        event.name = data.get('name', event.name)
        event.location = data.get('location', event.location)
        if data.get('starts_at'):
            event.starts_at = datetime.fromisoformat(data['starts_at'].replace('Z', ''))
        if data.get('ends_at'):
            event.ends_at = datetime.fromisoformat(data['ends_at'].replace('Z', ''))
        db.session.commit()
        log_admin_action(get_jwt_identity(), "Edited Event", f"ID: {id}")
        return jsonify({"msg": "Event updated"}), 200

@admin_bp.route('/vendors', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def manage_vendors_root():
    if request.method == 'GET':
        vendors = User.query.filter(func.upper(User.role) == 'VENDOR').all()
        vendor_list = []
        for v in vendors:
            active_event_name = v.assigned_events[-1].name if v.assigned_events else "None"
            vendor_list.append({
                "id": v.id, "name": v.name, "business_name": v.business_name,
                "kra_pin": v.kra_pin, "email": v.email, "phone": v.phone_number,
                "status": v.status, "current_event": active_event_name
            })
        return jsonify({"vendors": vendor_list}), 200

    if request.method == 'POST':
        data = request.get_json()
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"msg": "Email already exists"}), 400

        temp_pw = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        
        new_vendor = User(
            name=data['name'], email=data['email'], role='VENDOR',
            phone_number=data.get('phone'), business_name=data.get('business_name'),
            kra_pin=data.get('kra_pin'), business_permit_no=data.get('business_permit_no'),
            status='active', must_change_password=True
        )
        new_vendor.set_password(temp_pw)
        db.session.add(new_vendor)
        db.session.flush()

        db.session.add(Wallet(vendor_id=new_vendor.id, current_balance=0.0))
        
        if data.get('event_id'):
            event = Event.query.get(data['event_id'])
            if event: event.vendors.append(new_vendor)
            
        db.session.commit()
        send_credentials_email(new_vendor, temp_pw, "Vendor")
        log_admin_action(get_jwt_identity(), "Created Vendor", f"Vendor: {new_vendor.email}")
        return jsonify({"msg": "Vendor created and email sent"}), 201

@admin_bp.route('/vendors/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_single_vendor(id):
    vendor = User.query.get_or_404(id)
    if vendor.role != 'VENDOR': 
        return jsonify({"msg": "Not a vendor"}), 400

    if request.method == 'DELETE':
        db.session.delete(vendor)
        db.session.commit()
        log_admin_action(get_jwt_identity(), "Deleted Vendor", f"ID: {id}")
        return jsonify({"msg": "Vendor deleted"}), 200

    if request.method == 'PUT':
        try:
            data = request.get_json()
            new_email = data.get('email')
            if new_email and new_email != vendor.email:
                existing_user = User.query.filter(User.email == new_email, User.id != id).first()
                if existing_user:
                    return jsonify({"msg": "Email already exists"}), 400
                vendor.email = new_email

            vendor.name = data.get('name', vendor.name)
            vendor.phone_number = data.get('phone', vendor.phone_number)
            vendor.business_name = data.get('business_name', vendor.business_name)
            vendor.kra_pin = data.get('kra_pin', vendor.kra_pin)
            vendor.business_permit_no = data.get('business_permit_no', vendor.business_permit_no)
            
            if 'event_id' in data and data['event_id']:
                new_event = Event.query.get(data['event_id'])
                if new_event:
                    vendor.assigned_events = [new_event]

            db.session.commit()
            log_admin_action(get_jwt_identity(), "Edited Vendor", f"ID: {id}")
            return jsonify({"msg": "Vendor updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": "Server error", "error": str(e)}), 500

@admin_bp.route('/vendors/<int:id>/reset-password', methods=['POST'])
@jwt_required()
@admin_required
def reset_vendor_password(id):
    vendor = User.query.get_or_404(id)
    if vendor.role != 'VENDOR': return jsonify({"msg": "Action allowed for vendors only"}), 400
    try:
        temp_pw = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        vendor.set_password(temp_pw)
        vendor.must_change_password = True 
        db.session.commit()
        send_credentials_email(vendor, temp_pw, "Vendor (Password Reset)")
        log_admin_action(get_jwt_identity(), "Reset Vendor Password", f"Vendor: {vendor.email}")
        return jsonify({"msg": "Password reset successful"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to reset password"}), 500

@admin_bp.route('/users', methods=['GET', 'POST'])
@jwt_required()
@admin_required
def manage_admins_root():
    if request.method == 'GET':
        admins = User.query.filter(User.role.in_(['ADMIN', 'ADMINISTRATOR', 'MANAGER'])).all()
        return jsonify([{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "status": u.status} for u in admins]), 200

    if request.method == 'POST':
        data = request.get_json()
        if User.query.filter_by(email=data['email']).first(): return jsonify({"msg": "User already exists"}), 400
        temp_pw = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        new_user = User(
            name=data['name'], email=data['email'], role=data['role'].upper(),
            phone_number=data.get('phone', "0000000000"), must_change_password=True, status='active'
        )
        new_user.set_password(temp_pw)
        db.session.add(new_user)
        db.session.commit()
        send_credentials_email(new_user, temp_pw, "Administrator")
        log_admin_action(get_jwt_identity(), "Created Admin", f"User: {data['email']}")
        return jsonify({"msg": "Admin created"}), 201

@admin_bp.route('/users/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_single_admin(id):
    user = User.query.get_or_404(id)
    if user.id == int(get_jwt_identity()): return jsonify({"msg": "Cannot modify yourself"}), 400
    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        log_admin_action(get_jwt_identity(), "Deleted Admin", f"User: {user.email}")
        return jsonify({"msg": "Admin deleted"}), 200
    if request.method == 'PUT':
        data = request.get_json()
        user.status = data.get('status', user.status)
        db.session.commit()
        return jsonify({"msg": "Status updated"}), 200

@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify([{
        "id": l.id, "action": l.action, "user": l.user.name if l.user else "System",
        "details": l.details, "date": l.created_at.strftime("%Y-%m-%d %H:%M")
    } for l in logs]), 200

@admin_bp.route('/reports/export', methods=['GET'])
@jwt_required()
@admin_required
def export_report():
    sales = Sale.query.filter_by(status='COMPLETED').all()
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Sale ID', 'Date', 'Amount (KES)', 'Method', 'Cashier', 'Status'])
    total = 0
    for s in sales:
        total += s.total_amount
        cw.writerow([s.id, s.created_at, s.total_amount, s.payment_method, s.cashier_id, s.status])
    cw.writerow([])
    cw.writerow(['TOTAL', '', total])
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=sales_report.csv"
    output.headers["Content-type"] = "text/csv"
    return output

@admin_bp.route('/reports/payment-methods', methods=['GET'])
@jwt_required()
@admin_required
def get_payment_method_stats():
    today = datetime.utcnow().date()
    results = db.session.query(Sale.payment_method, func.sum(Sale.total_amount).label('total'))\
        .filter(func.date(Sale.created_at) == today, Sale.status == 'COMPLETED')\
        .group_by(Sale.payment_method).all()
    
    total_sum = sum(r.total for r in results) or 1 
    stats = [{"label": r.payment_method, "value": round((r.total / total_sum) * 100, 1), "color": "#22c55e" if "MPESA" in r.payment_method.upper() else "#6366f1"} for r in results]
    return jsonify(stats), 200

@admin_bp.route('/reports/top-vendors', methods=['GET'])
@jwt_required()
@admin_required
def get_top_vendors():
    results = db.session.query(
        User.business_name, User.name, User.email,
        func.sum(Sale.total_amount).label('total_sales'),
        func.count(Sale.id).label('transaction_count')
    ).join(Sale, Sale.cashier_id == User.id)\
     .filter(Sale.status == 'COMPLETED')\
     .group_by(User.id).order_by(func.sum(Sale.total_amount).desc()).limit(5).all()

    return jsonify([{
        "name": r.business_name if r.business_name else r.name,
        "email": r.email,
        "amount": float(r.total_sales),
        "count": r.transaction_count
    } for r in results]), 200