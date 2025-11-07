from django.urls import path
from .views import (
    RetrieveClassificationView,
    UpdateClassificationView,
)


classification_urlpatterns = [
    path('classificacao/consultar/<int:pk>/', RetrieveClassificationView.as_view(), name='visualizar-classificacao'),
    path('classificacao/alterar/<int:pk>/', UpdateClassificationView.as_view(), name='alterar-classificacao'),
]
