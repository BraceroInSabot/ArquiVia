# DJANGO
from django.urls import path

# PROJECT
from .views import ( 
    LoginTokenObtainPairView, 
    LoginTokenRefreshPairView, 
    LogoutTokenView, 
    RegisterTokenView, 
    # RequisicaoRedefinicaoSenhaView,
    # ValidarTokenRedefinicaoValidoView,
    # RedefinirSenhaView 
)

urlpatterns = [
    # Authentication
    path("entrar", LoginTokenObtainPairView.as_view()),
    path("atualizar-token", LoginTokenRefreshPairView.as_view()),
    path("sair", LogoutTokenView.as_view()),
    path("criar-conta", RegisterTokenView.as_view()),
] + [
    # Password Reset
    # path("esqueci-senha", RequisicaoRedefinicaoSenhaView.as_view()),
    # path("validar-token-senha/<str:token>", ValidarTokenRedefinicaoValidoView.as_view()),
    # path("redefinir-senha/<str:token>", RedefinirSenhaView.as_view()),
]