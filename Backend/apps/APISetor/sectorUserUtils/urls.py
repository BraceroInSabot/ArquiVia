from django.urls import path

from .views import ( 
    AddUserToSectorView
    )

sector_user_urlpatterns = [
    path("adicionar-usuario/<int:pk>/", AddUserToSectorView.as_view(), name="adicionar-usuario-setor"),
]