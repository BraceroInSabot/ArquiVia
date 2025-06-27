from django.urls import path

from .views import ( 
    CreateSectorView,
    ShowSectorView,
    ListSectorsView,
    ActivateDeactivateSectorView,
    ShowSectorView,
    UpdateSectorView,
    DeleteSectorView,
    AddUserToSectorView
    )

urlpatterns = [
    path("criar", CreateSectorView.as_view(), name="criar-setor"),
    path("consultar", ShowSectorView.as_view(), name="consultar-setor"),
    path("listar", ListSectorsView.as_view(), name="listar-setores"),
    path("ativar-desativar", ActivateDeactivateSectorView.as_view(), name="ativar-desativar-setor"),
    path("visualizar", ShowSectorView.as_view(), name="visualizar-setor"),
    path("atualizar", UpdateSectorView.as_view(), name="atualizar-setor"),
    path("deletar", DeleteSectorView.as_view(), name="deletar-setor"),
    path("adicionar-usuario", AddUserToSectorView.as_view(), name="adicionar-usuario-setor"),
]