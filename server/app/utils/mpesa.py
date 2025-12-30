import requests
import base64
import os
from datetime import datetime
from requests.auth import HTTPBasicAuth

class MpesaClient:
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.shortcode = os.getenv('MPESA_SHORTCODE')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.base_url = "https://sandbox.safaricom.co.ke" 
        self.callback_url = os.getenv('MPESA_CALLBACK_URL')

    def get_access_token(self):
        """
        1. Authenticates with Safaricom to get a temporary time-bound token.
        """
        api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        try:
            response = requests.get(
                api_url, 
                auth=HTTPBasicAuth(self.consumer_key, self.consumer_secret)
            )
            response.raise_for_status() # Check for errors
            
            # Extract the token from the JSON response
            access_token = response.json().get('access_token')
            return access_token
        except Exception as e:
            print(f"Error generating token: {e}")
            return None

    def generate_password(self):
        """
        2. Generates the mandatory base64 password.
        Format: Base64(Shortcode + Passkey + Timestamp)
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.shortcode}{self.passkey}{timestamp}"
        
        encoded_string = base64.b64encode(data_to_encode.encode('utf-8'))
        decoded_password = encoded_string.decode('utf-8')
        
        return decoded_password, timestamp

    def stk_push(self, phone_number, amount, account_reference="RadaPOS"):
        """
        3. The Main Event: Triggers the popup on the user's phone.
        """
        token = self.get_access_token()
        if not token:
            return {"error": "Failed to get access token"}

        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

        # Safaricom requires phone numbers in format 2547XXXXXXXX
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
        
        # If number starts with '0', replace with '254'
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,     # Customer's number
            "PartyB": self.shortcode,   # Our Paybill (Shortcode)
            "PhoneNumber": phone_number,# Customer's number again
            "CallBackURL": self.callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": "Payment for Goods"
        }

        try:
            response = requests.post(
                f"{self.base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers
            )
            return response.json()
        except Exception as e:
            return {"error": str(e)}

# Create a singleton instance to use elsewhere
mpesa = MpesaClient()