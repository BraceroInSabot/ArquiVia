from django.urls import path

from .views import ( 
    CreateDocumentView,
    ListDocumentView,
    )

urlpatterns = [
    path("criar", CreateDocumentView.as_view(), name="criar-documento"),
    path("visualizar", ListDocumentView.as_view(), name="criar-documento-slash"),
]