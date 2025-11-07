from django.urls import path
from .views import CreateCategoryView, ListCategoryView, UpdateCategoryView, DeleteCategoryView

category_urlpatterns = [
    path('categoria/criar/', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/visualizar', ListCategoryView.as_view(), name='listar-categorias'),
    path('categoria/editar', UpdateCategoryView.as_view(), name='editar-categoria'),
    path('categoria/deletar', DeleteCategoryView.as_view(), name='deletar-categoria')
]
