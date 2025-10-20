from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.utils import default_response
from .serializers import SectorCreateSerializer
from .permissions import IsEnterpriseOwner
from rest_framework import status


# Typing
from apps.APIUser.models import AbsUser as UserModel

USER = get_user_model()

class CreateSectorView(APIView):
    permission_classes = [IsAuthenticated, IsEnterpriseOwner]
    
    def post(self, request):
        serializer = SectorCreateSerializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        
        sector = serializer.save()
        
        res: HttpResponse = Response()
        res.status_code = 201
        res.data = default_response(success=True, message="Setor criado com sucesso!", data=serializer.data)
        return res
    
class RetrieveSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sector_id = request.data.get("sector_id")
        
        try:
            sector: Sector = Sector.objects.filter(sector_id=sector_id).first()          
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Setor não existente. Tente novamente."
                    }}
            return res 

        try:
            if sector.enterprise.owner != request.user or SectorUser.objects.filter(user=request.user, sector=sector).exists():
                res = Response()
                res.status_code=403
                res.data = {"Data": 
                            { 
                                "sucesso": False,
                                "mensagem": f"Você não tem permissão para acessar este setor."
                        }}
                return res
        except:
            res = Response()
            res.status_code=403
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Houve um erro ao tentar acessar o setor. Tente novamente."
                    }}
            return res
       
        data = {
            "name": sector.name,
            "manager": sector.manager.name,
            "image": sector.image,
            "created_at": timezone.localtime(sector.creation_date).strftime("%H:%M:%S - %d-%m-%Y"),
            "works_at": sector.enterprise.name,
            "is_active": sector.is_active
        }
        
        res = Response()
        res.status_code=200
        res.data = data
        return res
    
class ListSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        enterprise_id = request.data.get("enterprise_id")
        
        try:
            enterprise: Enterprise = Enterprise.objects.filter(ent_id=enterprise_id).first()          
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Empresa não encontrada. Tente novamente."
                    }}
            return res 
        
        try:
            if enterprise.owner == request.user:
                sectors = Sector.objects.filter(enterprise=enterprise)
            else:
                sectors = Sector.objects.filter(enterprise=enterprise, sectoruser__user=request.user, is_active=True)
        except:
            res = Response()
            res.status_code=403
            res.data = {"Data":
                        { 
                            "sucesso": False,
                            "mensagem": "Você não tem permissão para acessar os setores desta empresa."
                    }}
            return res

        data = []
        
        for sector in sectors:
            data.append({
                "sector_id": sector.sector_id,
                "name": sector.name,
                "manager": sector.manager.name,
                "image": sector.image,
                "created_at": timezone.localtime(sector.creation_date).strftime("%H:%M:%S - %d-%m-%Y"),
                "is_active": sector.is_active
            })
        
        res = Response()
        res.status_code=200
        res.data = data
        return res

class ActivateOrDeactivateSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        sector_id = request.data.get("sector_id")
        
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
        
        if sector.enterprise.owner != request.user or sector.manager != request.user:
            res = Response()
            res.status_code=403
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Você não tem permissão para ativar/desativar este setor."
                    }}
            return res

        if sector.is_active:
            sector.is_active = False
        else:
            sector.is_active = True

        sector.save()

        res = Response()
        res.status_code = 200
        res.data = {"Data": 
                { 
                    "sucesso": True,
                    "mensagem": f"Setor {'ativado' if sector.is_active else 'desativado'} com sucesso."
            }}
        return res

class EditSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        sector_id = request.data.get("sector_id")
        name = request.data.get("name")
        image = request.data.get("image")
        
        try:
            sector: Sector = Sector.objects.filter(sector_id=sector_id).first()          
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Setor não encontrado. Tente novamente."
                    }}
            return res 
        
        if sector.enterprise.owner != request.user or sector.manager != request.user or SectorUser.objects.filter(sector=sector, user=request.user, is_adm=True).exists():
            res = Response()
            res.status_code=403
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Você não tem permissão para atualizar este setor."
                    }}
            return res
        
        if name:
            sector.name = name
        if image:
            sector.image = image
        
        sector.save()

        res = Response()
        res.status_code = 200
        res.data = {"Data": 
                { 
                    "sucesso": True,
                    "mensagem": "Setor atualizado com sucesso."
            }}
        return res
    
class ExcludeSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        sector_id = request.data.get("sector_id")
        
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
        
        if sector.enterprise.owner != request.user or sector.manager != request.user or SectorUser.objects.filter(sector=sector, user=request.user, is_adm=True).exists():
            res = Response()
            res.status_code=403
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Você não tem permissão para deletar este setor."
                    }}
            return res
        
        sector.delete()

        res = Response()
        res.status_code = 200
        res.data = {"Data": 
                { 
                    "sucesso": True,
                    "mensagem": "Setor deletado com sucesso."
            }}
        return res
    
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