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


AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID_PRODUCTION')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY_PRODUCTION')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME_PRODUCTION')

AWS_CLOUDFRONT_KEY_ID = os.getenv('AWS_CLOUDFRONT_KEY_ID_PRODUCTION')
AWS_CLOUDFRONT_KEY = os.getenv('AWS_CLOUDFRONT_KEY_PRODUCTION', str).encode('ascii').strip()

AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME')

AWS_S3_CUSTOM_DOMAIN = 'd11hjx0dpct8kv.cloudfront.net'

AWS_S3_FILE_OVERWRITE = False

AWS_QUERYSTRING_AUTH = True
AWS_QUERYSTRING_EXPIRE = 3600 

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "region_name": AWS_S3_REGION_NAME,
            "location": "media", 
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "region_name": AWS_S3_REGION_NAME,
            "location": "static", 
        },
    },
}

STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"