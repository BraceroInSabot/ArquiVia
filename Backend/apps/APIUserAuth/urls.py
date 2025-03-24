from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path

from .views import LoginTokenObtainPairView, LoginTokenRefreshPairView, LogoutTokenView, RegisterTokenView

urlpatterns = [
    path("token/entrar", LoginTokenObtainPairView.as_view(), name="entrar"),
    path("token/atualizar-token", LoginTokenRefreshPairView.as_view(), name="atualizar-token"),
    path("token/sair", LogoutTokenView.as_view(), name='sair'),
    path("token/criar-conta", RegisterTokenView.as_view(), name='criar'),
]
