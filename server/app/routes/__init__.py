from app.routes.transaction import transaction_bp

app.register_blueprint(transaction_bp, url_prefix="/transactions")
from app.routes.auth_routes import auth_bp