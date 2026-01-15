from flask import Flask
from config import Config
from app.extensions import db, bcrypt, jwt, mail, migrate
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app, resources={r"/*": {
        "origins": [
            "http://localhost:5173",
            "https://rada-pos.vercel.app",
            "https://rada-nn93ji0xv-davemurius-projects.vercel.app"
        ]
    }}, supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.product_routes import product_bp
    from app.routes.transaction_routes import transaction_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.staff_routes import staff_bp
    from app.routes.mpesa_routes import mpesa_bp
    from app.routes.settings_routes import settings_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.vendor_routes import vendor_bp
    from app.routes.notification_routes import notification_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    app.register_blueprint(mpesa_bp, url_prefix='/api/payments')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(vendor_bp, url_prefix='/api/vendor')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')

    return app