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