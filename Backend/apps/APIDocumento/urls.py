from django.urls import path

from .views import ( 
    CreateDocumentView,
    ListDocumentView,
    ShowDocumentView,
    UpdateDocumentView,
    ActivateOrDeactivateDocumentView,
    DeleteDocumentView
    )

from .classificationUtils.urls import classification_urlpatterns
from .categoryUtils.urls import category_urlpatterns

urlpatterns = [
    path("criar/", CreateDocumentView.as_view(), name="criar-documento"),
    path("consultar/<int:pk>/", ShowDocumentView.as_view(), name="consultar-documento"),
    path("visualizar/", ListDocumentView.as_view(), name="visualizar-documento"),
    path("alterar/<int:pk>/", UpdateDocumentView.as_view(), name="alterar-documento"),
    path("ativar-desativar/<int:pk>/", ActivateOrDeactivateDocumentView.as_view(), name="ativar-ou-desativar-documento"),
    path("excluir/<int:pk>/", DeleteDocumentView.as_view(), name="excluir-documento"),
] + classification_urlpatterns + category_urlpatterns