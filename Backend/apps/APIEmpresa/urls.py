from django.urls import path

from .views import ( 
    CreateEnterpriseView,
    ShowEnterpriseView,
    ListEnterpriseView
    )

urlpatterns = [
    path("criar", CreateEnterpriseView.as_view(), name="criar-empresa"),
    path("visualizar", ShowEnterpriseView.as_view(), name="ver-empresa"),
    path("listar", ListEnterpriseView.as_view(), name="listar-empresas"),
]