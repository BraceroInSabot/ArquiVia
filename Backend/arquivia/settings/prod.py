from .settings import *
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()

SECRET_KEY = os.getenv("S_KEY")

DEBUG = os.getenv("DEBUG")

ALLOWED_HOSTS = ["*"]

# docker run -p 5432:5432 -e POSTGRES_PASSWORD=1234 postgres
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "AnnotaPS-Desenvolvimento",
        "USER": "postgres",
        "PASSWORD": "1234",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    "USER_ID_FIELD": "user_id"
}