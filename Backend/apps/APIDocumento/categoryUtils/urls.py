from django.urls import path
from .views import (
    CreateCategoryView,
    ListAvailableCategoriesView, 
    RetrieveCategoryView, 
    ListCategoryView, 
    UpdateCategoryView, 
    DeleteCategoryView, 
    LinkCategoriesToDocumentView,
    ListCategoriesByDocumentView)

category_urlpatterns = [
    path('categoria/criar/', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/consultar/<int:pk>/', RetrieveCategoryView.as_view(), name='consultar-categoria'),
    path('categoria/visualizar/<int:pk>/', ListCategoryView.as_view(), name='listar-categorias'),
    path('categoria/alterar/<int:pk>/', UpdateCategoryView.as_view(), name='alterar-categoria'),
    path('categoria/excluir/<int:pk>/', DeleteCategoryView.as_view(), name='excluir-categoria'),
    path('categoria/vincular-categorias/<int:pk>/', LinkCategoriesToDocumentView.as_view(), name='vincular-categorias-documento'),
    path('categoria/visualizar/vinculos/<int:pk>/', ListCategoriesByDocumentView.as_view(), name='listar-vinculos-categoria'),
    path('categoria/visualizar/disponiveis/<int:pk>/', ListAvailableCategoriesView.as_view(), name='listar-disponiveis-categoria'),
]
