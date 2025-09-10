from django.urls import path

from .views import ( 
    CreateDocumentView
    )

urlpatterns = [
    path("criar", CreateDocumentView.as_view(), name="criar-documento"),
]