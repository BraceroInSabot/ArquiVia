from django.urls import path
from .views import (
    CreateCategoryView,
    ListAvailableCategoriesByDocumentIdView, 
    RetrieveCategoryView, 
    ListCategoryView, 
    UpdateCategoryView, 
    DeleteCategoryView, 
    LinkCategoriesToDocumentView,
    ListCategoriesByDocumentView,
    ListAllDisponibleCategoriesView)

category_urlpatterns = [
    path('categoria/criar/<int:pk>/', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/consultar/<int:pk>/', RetrieveCategoryView.as_view(), name='consultar-categoria'),
    path('categoria/visualizar/<int:pk>/', ListCategoryView.as_view(), name='listar-categorias'),
    path('categoria/alterar/<int:pk>/', UpdateCategoryView.as_view(), name='alterar-categoria'),
    path('categoria/excluir/<int:pk>/', DeleteCategoryView.as_view(), name='excluir-categoria'),
    path('categoria/vincular-categorias/<int:pk>/', LinkCategoriesToDocumentView.as_view(), name='vincular-categorias-documento'),
    path('categoria/visualizar/vinculos/<int:pk>/', ListCategoriesByDocumentView.as_view(), name='listar-vinculos-categoria'),
    path('categoria/visualizar/disponiveis/<int:pk>/', ListAvailableCategoriesByDocumentIdView.as_view(), name='listar-categoria-disponiveis-documento'),
    path('categoria/visualizar/disponiveis/', ListAllDisponibleCategoriesView.as_view(), name='listar-categorias-disponiveis')
]
