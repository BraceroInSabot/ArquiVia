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
    path("consultar", RetrieveEnterpriseView.as_view(), name="consultar-empresa"),
    path("visualizar", ListEnterpriseView.as_view(), name="visualizar-empresas"),
    path("alterar", EditEnterpriseView.as_view(), name="alterar-empresa"),
    path("ativar-desativar", ActivateOrDeactivateEnterpriseVIew.as_view(), name="ativar-desativar-empresa"),
    path("excluir", ExcludeEnterpriseView.as_view(), name="excluir-empresa"),
]