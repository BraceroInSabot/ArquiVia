from .settings import *
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv(".env")

SECRET_KEY = os.getenv("S_KEY")

DEBUG = os.getenv("DEBUG")

ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True  
SESSION_COOKIE_DOMAIN = "localhost"
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies" 
SESSION_COOKIE_HTTPONLY = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = "localhost"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER") 
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

FRONTEND_URL = "http://127.0.0.1:3000"

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    "USER_ID_FIELD": "user_id",
     "AUTH_ERROR_MESSAGES": {
        'no_active_account': 'As credenciais fornecidas estão incorretas ou a conta está inativa.'
    }
}