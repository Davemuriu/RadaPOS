import base64
import requests
from datetime import datetime

from app.config import Config

class DarajaService:

    @staticmethod
    def generate_password():
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        data = f"{Config.DARAJA_SHORTCODE}{Config.DARAJA_PASSKEY}{timestamp}"
        encoded = base64.b64encode(data.encode()).decode()
        return encoded, timestamp

    @staticmethod
    def stk_push(phone, amount, reference):
        password, timestamp = DarajaService.generate_password()

        payload = {
            "BusinessShortCode": Config.DARAJA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": Config.DARAJA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": Config.DARAJA_CALLBACK_URL,
            "AccountReference": reference,
            "TransactionDesc": "RadaPOS Wallet Topup"
        }

        headers = {
            "Authorization": f"Bearer {Config.DARAJA_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            Config.DARAJA_STK_URL,
            json=payload,
            headers=headers,
            timeout=30
        )

        return response.json()
