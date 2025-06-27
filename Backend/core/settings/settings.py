from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INSTALLED_APPS =  [
    "apps.APIUser",
    "apps.APIEmpresa",
    "apps.APISetor",
] + [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
] + [
    "rest_framework_simplejwt",
    "rest_framework",
    "corsheaders",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.APIUser.utils.autenticacao.CookiesJWTAuth",
    ),
    "DEFAULT_PERMISSION_CLASSES": {
        "rest_framework.permissions.IsAuthenticated",
    }
}

SIMPLE_JWT = {
    "USER_ID_FIELD": "user_id",
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
] + [
    "corsheaders.middleware.CorsMiddleware",
    # "apps.APIUserAuth.utils.custom_middleware.PartitionedCookieMiddleware"
]



ROOT_URLCONF = "core.urls"

import os

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

WSGI_APPLICATION = "core.wsgi.application"

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

from typing import TypedDict

class ResponseType(TypedDict):
    sucesso: bool
    mensagem: str

RESPONSE_PATTERN = ResponseType

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
