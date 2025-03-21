from .views import SetorView
from django.urls import path

urlpatterns = [
    path("setor/", SetorView.as_view()),
]
