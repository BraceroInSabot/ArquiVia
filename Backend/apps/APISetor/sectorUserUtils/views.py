from typing import Union
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model


USER = get_user_model()

class AddUserToSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        sector_id = request.data.get("sector_id")
        user_email = request.data.get("user_email")
        
        try:
            sector: Sector = Sector.objects.filter(sector_id=sector_id).first()          
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Setor não encontrado. Tente novamente."
                    }}
            return res 

        if sector.enterprise.owner != request.user and not SectorUser.objects.filter(sector=sector, user=request.user, is_adm=True).exists():
            res = Response()
            res.status_code=403
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Você não tem permissão para adicionar usuários a este setor."
                    }}
            return res
        
        try:
            user: UserModel = USER.objects.filter(email=user_email).first()
        except USER.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário não encontrado. Tente novamente."
                    }}
            return res 
        
        if SectorUser.objects.filter(sector=sector, user=user).exists():
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário já está vinculado a este setor."
                    }}
            return res 
        
        sector_user = SectorUser(
            sector=sector,
            user=user
        )
        sector_user.save()

        res = Response()
        res.status_code = 200
        res.data = {"Data": 
                { 
                    "sucesso": True,
                    "mensagem": "Usuário adicionado ao setor com sucesso."
            }}
        return res