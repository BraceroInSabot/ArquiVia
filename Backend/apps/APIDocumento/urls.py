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

urlpatterns = [
    path("criar", CreateDocumentView.as_view(), name="criar-documento"),
    path("visualizar", ListDocumentView.as_view(), name="criar-documento-slash"),
    path("consultar", ShowDocumentView.as_view(), name="consultar-documento"),
    path("editar", UpdateDocumentView.as_view(), name="editar-documento"),
    path("ativar-desativar", ActivateOrDeactivateDocumentView.as_view(), name="ativar-ou-desativar-documento"),
    path("deletar", DeleteDocumentView.as_view(), name="deletar-documento"),
] + classification_urlpatterns