from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

# Gmail Kimlik Doğrulama (Kullanıcı Bazlı)
def gmail_authenticate(user_credentials):
    """
    Backend'den gelen kullanıcı credentials bilgileri ile Gmail API servisi oluşturur.
    """
    creds = Credentials(
        token=user_credentials['token'],
        refresh_token=user_credentials['refresh_token'],
        client_id=user_credentials['client_id'],
        client_secret=user_credentials['client_secret'],
        token_uri="https://oauth2.googleapis.com/token"
    )

    service = build('gmail', 'v1', credentials=creds)
    return service, creds