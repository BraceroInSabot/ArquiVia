from django.urls import path
from .views import EstaAutenticadoView, UsuarioInformacoesView, DesativarUsuarioView

urlpatterns = [
    path("verificar", EstaAutenticadoView.as_view(), name='verificar'),
    path("dados", UsuarioInformacoesView.as_view(), name='usuario'),
    path("desativar", DesativarUsuarioView.as_view(), name='desativar-usuario')
]