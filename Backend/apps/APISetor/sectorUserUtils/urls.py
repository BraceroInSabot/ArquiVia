from django.urls import path

from .views import ( 
    AddUserToSectorView,
    RemoveUserFromSectorView,
    SetManagerForSectorView,
    SetUnsetUserAdministrator,
    ListSectorUsersView,
    )

sector_user_urlpatterns = [
    path("adicionar-usuario/<int:pk>/", AddUserToSectorView.as_view(), name="adicionar-usuario-setor"),
    path("remover-usuario/<int:pk>/", RemoveUserFromSectorView.as_view(), name="remover-usuario-setor"),
    path("definir-gerente/<int:pk>/", SetManagerForSectorView.as_view(), name="definir-gerente-setor"),
    path("definir-administrador/<int:pk>/", SetUnsetUserAdministrator.as_view(), name="definir-administrador-setor"),
    path("listar-usuarios-setor/<int:pk>/", ListSectorUsersView.as_view(), name="listar-usuarios-setor"),
]