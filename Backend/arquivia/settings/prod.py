from .settings import *
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv(".env")

SECRET_KEY = os.getenv("S_KEY")

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", 't')

ALLOWED_HOSTS = ["bracero.com.br", "www.bracero.com.br"]

DATABASES = {
    'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv("DB_NAME"),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'), 
            'PORT': os.getenv('DB_PORT'),
        }
}

ALLOWED_HOSTS += [
    "bracero.com.br",
]

CORS_ALLOWED_ORIGINS += [
    "https://bracero.com.br",
]

CSRF_TRUSTED_ORIGINS += [
    "https://bracero.com.br",
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(days=1)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=3)