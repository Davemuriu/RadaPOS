from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt  # <--- ADD THIS
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()  # <--- ADD THIS

def create_app():
    app = Flask(__name__)

    # CORS CONFIGURATION
    CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"]}})

    # DATABASE CONFIGURATION
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'postgresql://rebecca:yourpassword@localhost/radapos'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_secret_key_here' # Needed for bcrypt/sessions

    # INITIALIZE PLUGINS
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)  # <--- ADD THIS

    # REGISTER BLUEPRINTS
    from app.routes.event_routes import event_bp
    app.register_blueprint(event_bp, url_prefix='/api')

    try:
        from app.routes.transaction import transaction_bp
        app.register_blueprint(transaction_bp, url_prefix='/api')
    except ImportError:
        pass

    return app