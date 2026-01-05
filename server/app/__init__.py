# app/__init__.py
from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, jwt, bcrypt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # models for migrations
    from .models import user, vendor, event, payout, package, audit_log  # noqa: F401

    # blueprints
    from .routes.auth_routes import auth_bp
    from .routes.admin_routes import admin_bp
    from .routes.event_routes import event_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(event_bp, url_prefix="/api/events")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    return app
