from django.urls import path
from .views import CreateCategoryView, RetrieveCategoryView, ListCategoryView, UpdateCategoryView, DeleteCategoryView

category_urlpatterns = [
    path('categoria/criar/', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/consultar/<int:pk>/', RetrieveCategoryView.as_view(), name='consultar-categoria'),
    path('categoria/visualizar', ListCategoryView.as_view(), name='listar-categorias'),
    path('categoria/alterar/<int:pk>/', UpdateCategoryView.as_view(), name='alterar-categoria'),
    path('categoria/deletar', DeleteCategoryView.as_view(), name='deletar-categoria')
]
