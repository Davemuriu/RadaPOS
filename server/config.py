import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'postgresql://postgres:password@localhost:5432/radapos_db')

    # Cloudinary
CLOUDINARY_CLOUD_NAME = "your_cloud_name"
CLOUDINARY_API_KEY = "your_api_key"
CLOUDINARY_API_SECRET = "your_api_secret"

# Email (SMTP)
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USERNAME = "your_email@gmail.com"
EMAIL_PASSWORD = "your_app_password"
EMAIL_FROM = "RadaPOS <your_email@gmail.com>"
# Daraja (M-Pesa)
DARAJA_SHORTCODE = "174379"
DARAJA_PASSKEY = "your_passkey"
DARAJA_CALLBACK_URL = "https://yourdomain.com/daraja/callback"
DARAJA_STK_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
DARAJA_ACCESS_TOKEN = "your_access_token"