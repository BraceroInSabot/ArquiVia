from django.urls import path

from .views import ( 
    CreateSectorView,
    ShowSectorView
    )

urlpatterns = [
    path("criar", CreateSectorView.as_view(), name="criar-setor"),
    path("consultar", ShowSectorView.as_view(), name="consultar-setor"),
]