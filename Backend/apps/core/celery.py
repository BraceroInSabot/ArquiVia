import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv('.env')

DEBUG = os.getenv("DEBUG", "False")

if DEBUG == "True":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arquivia.settings.dev')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arquivia.settings.prod') 

app = Celery('ArquiVia')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()