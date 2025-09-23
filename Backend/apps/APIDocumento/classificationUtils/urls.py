from django.urls import path
from .views import UpdateClasssificationView

classification_urlpatterns = [
    path('classificacao/editar', UpdateClasssificationView.as_view(), name='editar-classificacao'),
]
