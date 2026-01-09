from app.extensions import bcrypt

def hash_password(password):
    """
    Hashes a plain text password using Bcrypt.
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(password_hash, password):
    """
    Verifies a password against the stored hash.
    """
    return bcrypt.check_password_hash(password_hash, password)