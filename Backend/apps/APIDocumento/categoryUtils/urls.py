from django.urls import path
from .views import CreateCategoryView

category_urlpatterns = [
    path('categoria/criar', CreateCategoryView.as_view(), name='criar-categoria'),
]
