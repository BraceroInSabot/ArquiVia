from typing import Union
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from apps.APISetor.permissions import IsOwnerManagerOrSectorAdmin
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