import os
from dotenv import load_dotenv

# 1. LOAD .ENV
load_dotenv()

# 2. DIAGNOSTIC CHECK
print("------------------------------------------------")
print(" STARTUP DIAGNOSTICS")
print("------------------------------------------------")

# Check Email
mail_server = os.environ.get('MAIL_SERVER')
if mail_server:
    print(f" EMAIL:  Configured ({mail_server})")
else:
    print(f" EMAIL:  Missing MAIL_SERVER in .env")

# Check M-Pesa
shortcode = os.environ.get('MPESA_SHORTCODE')
passkey = os.environ.get('MPESA_PASSKEY')
callback = os.environ.get('MPESA_CALLBACK_URL')
consumer_key = os.environ.get('MPESA_CONSUMER_KEY')

if shortcode: print(f" MPESA:  Shortcode Found ({shortcode})")
else:         print(f" MPESA:  Missing MPESA_SHORTCODE")

if passkey:   print(f" MPESA:  Passkey Found")
else:         print(f" MPESA:  Missing MPESA_PASSKEY")

if callback:  print(f" MPESA:  Callback URL Found")
else:         print(f" MPESA:  Missing MPESA_CALLBACK_URL")

if consumer_key: print(f" MPESA:  Consumer Key Found")
else:            print(f" MPESA:  Missing MPESA_CONSUMER_KEY")

print("------------------------------------------------")

# 3. START APP
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5555)