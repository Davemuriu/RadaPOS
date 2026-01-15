import requests
import base64
from datetime import datetime
from flask import current_app

class MpesaService:
    @staticmethod
    def get_access_token():
        consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
        consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

        if not consumer_key or not consumer_secret:
            raise Exception("M-Pesa Consumer Key or Secret is missing in .env")

        try:
            r = requests.get(api_url, auth=(consumer_key, consumer_secret))
            r.raise_for_status()
            return r.json()['access_token']
        except Exception as e:
            print(f"❌ Token Gen Failed: {str(e)}")
            raise Exception("Failed to generate M-Pesa Token. Check credentials.")

    @staticmethod
    def initiate_stk_push(phone_number, amount, account_reference="RadaPOS"):
        """Handles Customer to Business (C2B) STK Push"""
        access_token = MpesaService.get_access_token()
        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        
        business_short_code = current_app.config.get('MPESA_SHORTCODE')
        passkey = current_app.config.get('MPESA_PASSKEY')
        callback_url = current_app.config.get('MPESA_CALLBACK_URL')
        
        if not all([business_short_code, passkey, callback_url]):
             raise Exception("M-Pesa Shortcode, Passkey or Callback URL missing")

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{business_short_code}{passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')

        # Format Phone (Ensure 254...)
        if phone_number.startswith('0'): phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+254'): phone_number = phone_number[1:]

        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": business_short_code,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": "POS Sale"
        }

        headers = { "Authorization": f"Bearer {access_token}" }

        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            # Print the actual response from Safaricom for debugging
            print(f"❌ M-Pesa API Error: {e.response.text}")
            raise Exception(f"M-Pesa API Error: {e.response.text}")
        except Exception as e:
            raise e

    @staticmethod
    def initiate_b2c(phone_number, amount, remarks="Withdrawal"):
        """Handles Business to Customer (B2C) Payouts"""
        access_token = MpesaService.get_access_token()
        
        # (Keep your B2C logic here)
        return {
            "ConversationID": "AG_MOCK_ID",
            "ResponseCode": "0",
            "ResponseDescription": "Success"
        }