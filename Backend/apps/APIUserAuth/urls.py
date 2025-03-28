from django.urls import path

from .views import LoginTokenObtainPairView, LoginTokenRefreshPairView, LogoutTokenView, RegisterTokenView

urlpatterns = [
    path("entrar", LoginTokenObtainPairView.as_view(), name="entrar"),
    path("atualizar-token", LoginTokenRefreshPairView.as_view(), name="atualizar-token"),
    path("sair", LogoutTokenView.as_view(), name='sair'),
    path("criar-conta", RegisterTokenView.as_view(), name='criar'),
]
