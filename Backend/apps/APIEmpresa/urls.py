from django.urls import path

from .views import ( 
    CreateEnterpriseView,
    RetrieveEnterpriseView,
    ListEnterpriseView,
    EditEnterpriseView,
    ActivateOrDeactivateEnterpriseVIew,
    ExcludeEnterpriseView
    )

urlpatterns = [
    path("criar", CreateEnterpriseView.as_view(), name="criar-empresa"),
    path("consultar/<int:pk>", RetrieveEnterpriseView.as_view(), name="consultar-empresa"),
    path("visualizar", ListEnterpriseView.as_view(), name="visualizar-empresas"),
    path("alterar/<int:pk>", EditEnterpriseView.as_view(), name="alterar-empresa"),
    path("ativar-desativar/<int:pk>", ActivateOrDeactivateEnterpriseVIew.as_view(), name="ativar-desativar-empresa"),
    path("excluir", ExcludeEnterpriseView.as_view(), name="excluir-empresa"),
]