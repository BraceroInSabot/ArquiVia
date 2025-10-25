from typing import Union
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.sectorUserUtils.serializers import SectorUserRoleSerializer
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from apps.APISetor.permissions import IsEnterpriseOwnerOrSectorManager, IsOwnerManagerOrSectorAdmin, IsLinkedToSector
from apps.core.utils import default_response


USER = get_user_model()

class AddUserToSectorView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerManagerOrSectorAdmin]
    
    def post(self, request, pk: int):
        user_email = request.data.get("user_email")
        
        if not user_email:
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="O campo 'email' é obrigatório.")
            return res
        
        sector_query: Union[Sector, None] = get_object_or_404(Sector, pk=pk)
        user_query: Union[USER, None] = get_object_or_404(USER, email=user_email) #type: ignore
        self.check_object_permissions(request, sector_query)
        
        if SectorUser.objects.filter(sector=sector_query, user=user_query).exists():
            res: HttpResponse = Response()
            res.status_code=400
            res.data = default_response(success=False, message="Usuário já está vinculado a este setor.") 
            return res 
        
        sector_user = SectorUser.objects.create(
            sector=sector_query,
            user=user_query,
            is_adm=False
        )

        res: HttpResponse = Response()
        res.status_code = 201
        res.data = default_response(success=True, message="Usuário adicionado ao setor com sucesso.")
        return res
    
class RemoveUserFromSectorView(APIView):
    """
    Removes a user's link (`SectorUser`) from a specific sector.

    The link is identified by its primary key (`pk`) passed in the URL.
    Requires authentication, and the requesting user must be the enterprise owner,
    the sector manager, or a sector admin of the sector from which the user
    is being removed.
    """
    permission_classes = [IsAuthenticated, IsOwnerManagerOrSectorAdmin]
    
    def delete(self, request, pk: int):
        sector_user_link = get_object_or_404(
            SectorUser.objects.select_related(
                'sector__enterprise__owner',
                'sector__manager'
            ), 
            pk=pk
        )
        sector_query: Sector = sector_user_link.sector
        self.check_object_permissions(request, sector_query)
        
        user_name = sector_user_link.user.name # type: ignore
        sector_user_link.delete()

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message=f"Usuário {user_name} removido do setor com sucesso.")
        return res
    
class SetManagerForSectorView(APIView):
    """
    Sets a new manager for a specific sector.

    The new manager must already be a member of the sector.
    Requires authentication, and the requesting user must be the 
    enterprise owner, current sector manager, or a sector admin.
    """
    permission_classes = [IsAuthenticated, IsOwnerManagerOrSectorAdmin]
    
    def patch(self, request, pk: int):
        new_manager_email = request.data.get("new_manager_email")
        
        if not new_manager_email:
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="O campo 'email' é obrigatório.")
            return res
        
        sector_query: Union[Sector, None] = get_object_or_404(Sector, pk=pk)
        new_manager_query: Union[USER, None] = get_object_or_404(USER, email=new_manager_email) #type: ignore
        self.check_object_permissions(request, sector_query)
        
        if SectorUser.objects.filter(sector=sector_query, user=new_manager_query).exists() is False:
            res: HttpResponse = Response()
            res.status_code=400
            res.data = default_response(success=False, message="O novo gerente deve ser um membro do setor.") 
            return res
        
        sector_query.manager = new_manager_query # type: ignore
        sector_query.save()

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Gerente do setor alterado com sucesso.")
        return res
    
class SetUnsetUserAdministrator(APIView):
    """
    Sets or unsets administrator privileges for a user within a specific sector.

    The user is identified by the SectorUser link's primary key (`pk`) passed in the URL.
    The action (grant or revoke admin) is determined by the `make_admin` boolean
    field in the request payload.

    Requires authentication, and the requesting user must be the enterprise owner,
    the sector manager, or a sector admin of the sector being modified.
    """
    permission_classes = [IsAuthenticated, IsEnterpriseOwnerOrSectorManager]
    
    def patch(self, request, pk: int):
        make_admin = request.data.get("make_admin")
        
        if make_admin is None or not isinstance(make_admin, bool):
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Erro na validação do tipo de dado enviado.")
            return res
        
        sector_user_query: Union[SectorUser, None] = get_object_or_404(SectorUser, pk=pk)
        sector_query: Sector = sector_user_query.sector
        self.check_object_permissions(request, sector_query)
        
        sector_user_query.is_adm = make_admin
        sector_user_query.save()

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message=f"Privilégios de administrador {"concedido" if make_admin else "removido"} com sucesso.")
        return res
    
class ListSectorUsersView(APIView):
    permission_classes = [IsAuthenticated, IsLinkedToSector] 
    
    def get(self, request, pk: int) -> HttpResponse:
        """
        Handles the GET request to list users for a specific sector.

        Args:
            request (Request): The user request object.
            pk (int): The primary key of the Sector to retrieve users from.

        Returns:
            HttpResponse: A response containing the list of users and their roles.
        """
        sector = get_object_or_404(
            Sector.objects.select_related('manager', 'enterprise__owner'), 
            pk=pk
        )

        self.check_object_permissions(request, sector)

        owner = sector.enterprise.owner
        manager = sector.manager

        sector_links = SectorUser.objects.filter(sector=sector).select_related('user')

        user_roles_map = {}

        user_roles_map[owner.pk] = {"user": owner, "role": "Proprietário"}
        
        if manager.pk not in user_roles_map:
            user_roles_map[manager.pk] = {"user": manager, "role": "Gestor"}
        
        for link in sector_links:
            if link.user.pk not in user_roles_map:
                role = "Administrador" if link.is_adm else "Membro"
                user_roles_map[link.user.pk] = {"user": link.user, "role": role}

        final_user_list = []
        for data in user_roles_map.values():
            user_obj = data["user"]
            setattr(user_obj, 'role', data["role"]) 
            final_user_list.append(user_obj)
            
        serializer = SectorUserRoleSerializer(final_user_list, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True, 
            message="Lista de usuários do setor recuperada com sucesso!", 
            data=serializer.data
        )
        return res