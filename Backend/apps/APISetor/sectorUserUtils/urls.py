from django.urls import path

from .views import ( 
    AddUserToSectorView,
    SetManagerForSectorView
    )

sector_user_urlpatterns = [
    path("adicionar-usuario/<int:pk>/", AddUserToSectorView.as_view(), name="adicionar-usuario-setor"),
    path("definir-gerente/<int:pk>/", SetManagerForSectorView.as_view(), name="definir-gerente-setor"),
]