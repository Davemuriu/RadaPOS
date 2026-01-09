# server/app/__init__.py
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from config import Config
from app.extensions import db

# Create the Migrate object at module level so `flask db` commands can find it
migrate = Migrate()

def create_app():
    """
    Application factory function.
    Creates and configures the Flask app, initializes extensions,
    and registers blueprints.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    migrate.init_app(app, db)  # Enables `flask db init/migrate/upgrade`

    #  Import blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.wallet_routes import wallet_bp
    from app.routes.transaction_routes import transaction_bp
    from app.routes.product_routes import product_bp
    from app.routes.event_routes import event_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(wallet_bp, url_prefix="/wallet")
    app.register_blueprint(transaction_bp, url_prefix="/transactions")
    app.register_blueprint(product_bp, url_prefix="/products")
    app.register_blueprint(event_bp, url_prefix="/events")

    return app
