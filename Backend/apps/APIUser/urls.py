# DJANGO
from django.urls import path

# PROJECT
from .views import ( 
    ChangePasswordView,
    EditUserView,
    LoginTokenObtainPairView, 
    LoginTokenRefreshPairView, 
    LogoutTokenView, 
    RegisterTokenView, 
    RetrieveUserView,
    RequisicaoRedefinicaoSenhaView,
    ValidarTokenRedefinicaoValidoView,
    RedefinirSenhaView,
    DeactivateUserView,
    UsersLinkedToMyListView
)

urlpatterns = [
    # Authentication
    path("entrar/", LoginTokenObtainPairView.as_view(), name="entrar"),
    path("atualizar-token/", LoginTokenRefreshPairView.as_view(), name="atualizar-token"),
    path("sair/", LogoutTokenView.as_view(), name="sair"),
    path("criar-conta/", RegisterTokenView.as_view(), name="criar-conta"),
] + [
    # User CRUD
    path("consultar/<str:username>/", RetrieveUserView.as_view(), name="consultar-usuario"),
    path("editar/<str:username>/", EditUserView.as_view(), name="editar-usuario"),
    path('alterar-senha/', ChangePasswordView.as_view(), name='alterar-senha'),
    path('desativar/', DeactivateUserView.as_view(), name='desativar-usuario'),
    path("listar/", UsersLinkedToMyListView.as_view(), name="usuario-listar"),
]+ [
    # Password Reset
    path("esqueci-senha/", RequisicaoRedefinicaoSenhaView.as_view(), name="esqueci-senha"),
    path("validar-token-senha/<str:token>/", ValidarTokenRedefinicaoValidoView.as_view(), name="validar-token-senha"),
    path("redefinir-senha/<str:token>/", RedefinirSenhaView.as_view(), name="redefinir-senha"),
]