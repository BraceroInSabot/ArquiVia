from .settings import *
from dotenv import load_dotenv
import os

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
        "HOST": "127.0.0.1",
        "PORT": "5432",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
]

CORS_ALLOW_CREDENTIALS = True  # Permite enviar cookies com credenciais

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
]
