from django.urls import path

from .views import ( 
    CreateEnterpriseView,
    ShowEnterpriseView,
    ListEnterpriseView,
    EditEnterpriseView,
    ActivateOrDeactivateEnterpriseVIew,
    ExcludeEnterpriseView
    )

urlpatterns = [
    path("criar", CreateEnterpriseView.as_view(), name="criar-empresa"),
    path("visualizar", ShowEnterpriseView.as_view(), name="ver-empresa"),
    path("listar", ListEnterpriseView.as_view(), name="listar-empresas"),
    path("editar", EditEnterpriseView.as_view(), name="editar-empresa"),
    path("ativar-desativar", ActivateOrDeactivateEnterpriseVIew.as_view(), name="ativar-desativar-empresa"),
    path("excluir", ExcludeEnterpriseView.as_view(), name="excluir-empresa"),
]