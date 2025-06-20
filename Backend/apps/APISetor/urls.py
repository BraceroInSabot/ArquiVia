from django.urls import path

from .views import ( 

    )

urlpatterns = [
    path("criar", CreateEnterpriseView.as_view(), name="criar-empresa"),
]