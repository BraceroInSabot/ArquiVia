from django.urls import path
from .views import RetrieveClassificationView

classification_urlpatterns = [
    path('classificacao/consultar/<int:pk>/', RetrieveClassificationView.as_view(), name='visualizar-classificacao'),
]
