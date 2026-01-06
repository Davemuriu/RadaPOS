from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from app.extensions import db, migrate, bcrypt, jwt

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    from app.routes.auth_routes import auth_bp
    from app.routes.transaction_routes import transaction_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(transaction_bp, url_prefix='/transactions')

    from app import models

    return app