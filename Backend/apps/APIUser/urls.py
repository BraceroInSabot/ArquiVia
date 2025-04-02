from django.urls import path
from .views import ( 
    EstaAutenticadoView, 
    UsuarioInformacoesView, 
    DesativarUsuarioView,
    AlterarSetorUsuarioView,
    AlterarSenhaUsuarioView,
    AlterarDadosUsuarioView
)

urlpatterns = [
    path("verificar", EstaAutenticadoView.as_view(), name='verificar'),
    path("dados", UsuarioInformacoesView.as_view(), name='usuario'),
    path("desativar", DesativarUsuarioView.as_view(), name='desativar-usuario'),
    path("alterar-setor", AlterarSetorUsuarioView.as_view(), name='alterar-setor'),
    path("alterar-senha", AlterarSenhaUsuarioView.as_view(), name='alterar-senha'),
    path("alterar-dados", AlterarDadosUsuarioView.as_view(), name="alterar-dados")
]