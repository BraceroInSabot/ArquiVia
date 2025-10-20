from .settings import *
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv(".env")

SECRET_KEY = os.getenv("S_KEY")
DEBUG = os.getenv("DEBUG")

ALLOWED_HOSTS += [
    "localhost",
    "127.0.0.1",
]

DATABASES = {
    'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'arquivia_db',
            'USER': 'arquivia',
            'PASSWORD': '123',
            'HOST': '179.125.60.185', 
            'PORT': '5432',
        }
}

CORS_ALLOWED_ORIGINS += [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS += [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

FRONTEND_URL = "http://127.0.0.1:3000"

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(days=1)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=7)