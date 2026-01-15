from flask import Flask
from config import Config
from app.extensions import db, bcrypt, jwt, cors, mail, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    cors.init_app(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
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
    app.register_blueprint(mpesa_bp, url_prefix='/api/mpesa')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(vendor_bp, url_prefix='/api/vendor')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')

    return app