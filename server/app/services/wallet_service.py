from app.models.wallet import Wallet
from app.extensions import db

class WalletService:
    @staticmethod
    def add_funds(vendor_id, amount):
        """Adds funds to a vendor's wallet. Creates wallet if missing."""
        wallet = Wallet.query.filter_by(vendor_id=vendor_id).first()
        
        if not wallet:
            wallet = Wallet(vendor_id=vendor_id, current_balance=0.0)
            db.session.add(wallet)
        
        wallet.current_balance += float(amount)
        db.session.commit()
        return wallet