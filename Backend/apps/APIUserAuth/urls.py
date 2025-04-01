from django.urls import path

from .views import ( 
    LoginTokenObtainPairView, 
    LoginTokenRefreshPairView, 
    LogoutTokenView, 
    RegisterTokenView, 
    RequisicaoRedefinicaoSenhaView,
    ValidarTokenRedefinicaoValidoView,
    RedefinirSenhaView )

urlpatterns = [
    path("entrar", LoginTokenObtainPairView.as_view(), name="entrar"),
    path("atualizar-token", LoginTokenRefreshPairView.as_view(), name="atualizar-token"),
    path("sair", LogoutTokenView.as_view(), name='sair'),
    path("criar-conta", RegisterTokenView.as_view(), name='criar'),
] + [
    path("esqueci-senha", RequisicaoRedefinicaoSenhaView.as_view(), name='esqueci-senha'),
    path("validar-token-senha/<str:token>", ValidarTokenRedefinicaoValidoView.as_view(), name="validar-token-senha"),
    path("redefinir-senha/<str:token>", RedefinirSenhaView.as_view(), name='redefinir-senha'),
]