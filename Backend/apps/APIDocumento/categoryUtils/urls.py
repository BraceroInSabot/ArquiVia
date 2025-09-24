from django.urls import path
from .views import CreateCategoryView, ShowCategoryView

category_urlpatterns = [
    path('categoria/criar', CreateCategoryView.as_view(), name='criar-categoria'),
    path('categoria/consultar', ShowCategoryView.as_view(), name='consultar-categoria'),
]
