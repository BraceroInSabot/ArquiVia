from django.urls import path

from .views import ( 
    CreateSectorView,
    RetrieveSectorView,
    ListUserSectorsView,
    ActivateOrDeactivateSectorView,
    EditSectorView,
    ExcludeSectorView,
    SectorReviewDateView
    )

from .sectorUserUtils.urls import sector_user_urlpatterns

urlpatterns = [
    path("criar/", CreateSectorView.as_view(), name="criar-setor"),
    path("consultar/<int:pk>/", RetrieveSectorView.as_view(), name="consultar-setor"),
    path("visualizar/", ListUserSectorsView.as_view(), name="listar-setores"),
    path("alterar/<int:pk>/", EditSectorView.as_view(), name="atualizar-setor"),
    path("ativar-desativar/<int:pk>/", ActivateOrDeactivateSectorView.as_view(), name="ativar-desativar-setor"),
    path("excluir/<int:pk>/", ExcludeSectorView.as_view(), name="deletar-setor"),
    path("<int:pk>/politica-revisao/", SectorReviewDateView.as_view(), name="sector-review-policy"),
] + sector_user_urlpatterns