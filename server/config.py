import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URI',
        'postgresql://postgres:MySecurePassword123@localhost:5432/radapos'
    )

    # Flask & JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretdevkey123")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretdevkey123")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "your_cloud_name")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "your_api_key")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "your_api_secret")

    # Email
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "your_email@gmail.com")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your_app_password")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "RadaPOS <your_email@gmail.com>")

    # Daraja
    DARAJA_SHORTCODE = os.getenv("DARAJA_SHORTCODE", "174379")
    DARAJA_PASSKEY = os.getenv("DARAJA_PASSKEY", "your_passkey")
    DARAJA_CALLBACK_URL = os.getenv("DARAJA_CALLBACK_URL", "https://yourdomain.com/daraja/callback")
    DARAJA_STK_URL = os.getenv("DARAJA_STK_URL", "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest")
    DARAJA_ACCESS_TOKEN = os.getenv("DARAJA_ACCESS_TOKEN", "your_access_token")
