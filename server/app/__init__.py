from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    
    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp
    from .routes.product_routes import product_bp
    from .routes.transaction_routes import transaction_bp
    
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(product_bp, url_prefix="/products")
    app.register_blueprint(transaction_bp, url_prefix="/transactions")
    
    return app