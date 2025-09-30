from django.urls import path
from .views import CreateCategoryView, ShowCategoryView, ListCategoryView, UpdateCategoryView

category_urlpatterns = [
    path('categoria/criar', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/consultar', ShowCategoryView.as_view(), name='consultar-categoria'),
    path('categoria/visualizar', ListCategoryView.as_view(), name='listar-categoria'),
    path('categoria/editar', UpdateCategoryView.as_view(), name='editar-categoria'),
]
