from django.urls import path

from .views import ( 
    CreateDocumentView,
    ListDocumentView,
    ShowDocumentView,
    UpdateDocumentView
    )

urlpatterns = [
    path("criar", CreateDocumentView.as_view(), name="criar-documento"),
    path("visualizar", ListDocumentView.as_view(), name="criar-documento-slash"),
    path("consultar", ShowDocumentView.as_view(), name="consultar-documento"),
    path("editar", UpdateDocumentView.as_view(), name="editar-documento"),
]