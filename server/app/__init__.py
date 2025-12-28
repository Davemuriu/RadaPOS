import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize extensions outside the factory
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app():
    # Load environment variables from .env
    load_dotenv()

    app = Flask(__name__)
    
    # Enable CORS so your React frontend (port 5173) can talk to this Backend (port 5000)
    CORS(app)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Initialize extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Import and Register Blueprints inside the factory to avoid "NameError"
    from app.routes.event_routes import event_bp
    from app.routes.transaction import transaction_bp
    # from app.routes.auth_routes import auth_bp  # Uncomment when David finishes this

    app.register_blueprint(event_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return {"message": "RadaPOS Backend is Running!"}

    return app