from .settings import *
from dotenv import load_dotenv
import os
from datetime import timedelta
import dj_database_url

load_dotenv(".env")

SECRET_KEY = os.getenv("S_KEY")

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", 't')

ALLOWED_HOSTS = ["bracero.com.br", "www.bracero.com.br"]

DATABASES = {
    'default': dj_database_url.parse(
        os.getenv('DB_URL', ''),
        conn_max_age=600, 
        conn_health_checks=True,
        ssl_require=os.getenv('DB_SSL_REQUIRE', 'False').lower() in ('true', '1', 't') 
    )
}

ALLOWED_HOSTS += [
    "bracero.com.br",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",         
    "http://127.0.0.1:3000",        
    "https://arquivia.pages.dev",      
    "https://arquivia.bracero.com.br",
    "https://www.arquivia.bracero.com.br", 
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",          
    "http://127.0.0.1:3000",        
    "https://arquivia.pages.dev",      
    "https://arquivia.bracero.com.br", 
    "https://www.arquivia.bracero.com.br",
]


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'
CORS_ALLOW_CREDENTIALS = True

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(days=1)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=3)