import requests
import base64
from datetime import datetime
from flask import current_app

class MpesaClient:
    @staticmethod
    def get_access_token():
        consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
        consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        
        try:
            r = requests.get(api_url, auth=(consumer_key, consumer_secret))
            r.raise_for_status()
            return r.json()['access_token']
        except Exception:
            return None

    @staticmethod
    def get_password(shortcode, passkey, timestamp):
        data_to_encode = str(shortcode) + str(passkey) + timestamp
        return base64.b64encode(data_to_encode.encode()).decode('utf-8')

    @staticmethod
    def initiate_stk_push(phone_number, amount, account_reference):
        token = MpesaClient.get_access_token()
        if not token:
            return {"error": "Authentication failed"}

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        shortcode = current_app.config.get('MPESA_SHORTCODE') or "174379"
        passkey = current_app.config.get('MPESA_PASSKEY') or "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        callback_url = current_app.config.get('MPESA_CALLBACK_URL')
        
        password = MpesaClient.get_password(shortcode, passkey, timestamp)

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": "POS Payment"
        }

        headers = { "Authorization": f"Bearer {token}" }
        
        try:
            response = requests.post(
                'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                json=payload, headers=headers
            )
            return response.json()
        except requests.exceptions.RequestException as e:
            if e.response is not None:
                return {"error": e.response.json()}
            return {"error": str(e)}