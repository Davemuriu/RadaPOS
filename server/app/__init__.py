from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from config import Config
from app.extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)

    # Enable CORS (allow all origins for dev)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Import and register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.wallet_routes import wallet_bp
    from app.routes.transaction_routes import transaction_bp
    from app.routes.product_routes import product_bp
    from app.routes.event_routes import event_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(wallet_bp, url_prefix="/wallet")
    app.register_blueprint(transaction_bp, url_prefix="/transactions")
    app.register_blueprint(product_bp, url_prefix="/products")
    app.register_blueprint(event_bp, url_prefix="/events")

    return app
