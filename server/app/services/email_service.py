import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import Config

class EmailService:
    @staticmethod
    def send_email(to_email, subject, message):
        """
        Sends a plain-text email.
        """
        msg = MIMEMultipart()
        msg["From"] = Config.EMAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(message, "plain"))

        try:
            server = smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT)
            server.starttls()
            server.login(Config.EMAIL_USERNAME, Config.EMAIL_PASSWORD)
            server.send_message(msg)
            server.quit()

            return True

        except Exception as e:
            raise RuntimeError(f"Email sending failed: {str(e)}")

    @staticmethod
    def send_simple_notification(to_email, message):
        return EmailService.send_email(
            to_email=to_email,
            subject="RadaPOS Notification",
            message=message
        )
