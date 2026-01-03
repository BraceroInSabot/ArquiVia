import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

INSTALLED_APPS = [
    # 1. DJANGO CORE
    'daphne',
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions", 
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "django.contrib.sites",
] + [
    # 2. THIRD PARTY
    "corsheaders", 
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    'simple_history',
    
    # oAuth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
] + [
    # 3. LOCAL APPS
    "apps.core",
    "apps.APIUser",
    "apps.APIPayment",
    "apps.APIEmpresa",
    "apps.APISetor",
    'channels',
    "apps.APIDocumento",
    'apps.APIAudit',
    'apps.APIDashboard',
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.APIUser.utils.autenticacao.CookiesJWTAuth",
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    "DEFAULT_PERMISSION_CLASSES": {
        "rest_framework.permissions.IsAuthenticated",
    },
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    'simple_history.middleware.HistoryRequestMiddleware',
    "apps.core.get_request_user.RequestMiddleware",
    "allauth.account.middleware.AccountMiddleware", 
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "arquivia.urls"

ALLOWED_HOSTS = []

CORS_ALLOWED_ORIGINS = []

CSRF_TRUSTED_ORIGINS = []

CORS_ALLOW_CREDENTIALS = True

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=2),
    "USER_ID_FIELD": "user_id",
    "AUTH_ERROR_MESSAGES": {
        'no_active_account': 'As credenciais fornecidas estão incorretas ou a conta está inativa.'
    }
}

REST_SESSION_LOGIN = False

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        'DIRS': [
            os.path.join(BASE_DIR, "templates")
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "arquivia.wsgi.application"
ASGI_APPLICATION = "arquivia.asgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "pt-br"

TIME_ZONE = "America/Sao_Paulo"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"

AUTH_USER_MODEL = "APIUser.AbsUser"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SITE_ID = 1

REST_USE_JWT = True
JWT_AUTH_COOKIE = 'access_token' 
JWT_AUTH_REFRESH_COOKIE = 'refresh_token'

ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'none'

SOCIALACCOUNT_ADAPTER = 'apps.APIUser.adapters.GoogleAutoLinkAdapter'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'VERIFIED_EMAIL': True
    }
}

REST_AUTH_SERIALIZERS = {
    'USER_DETAILS_SERIALIZER': 'apps.APIUser.serializers.UserDetailSerializer', # Ajuste o caminho
    'JWT_SERIALIZER': 'dj_rest_auth.serializers.JWTSerializer',
}

CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60 # 30 min

CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True