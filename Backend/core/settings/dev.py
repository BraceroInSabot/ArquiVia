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
