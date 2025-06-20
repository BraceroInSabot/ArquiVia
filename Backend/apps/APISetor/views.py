from django.shortcuts import render
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Sector, KeyCodeSector
from apps.APIEmpresa.models import Enterprise

class CreateSectorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        name = request.data.get("name")
        image = request.data.get("image")
        enterprise = request.data.get("enterprise_id")
        
        try:
            enterprise: Enterprise = Enterprise.objects.filter(ent_id=enterprise).first()          
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Erro ao vincular o setor a empresa. Tente novamente."
                    }}
            return res 
        
        if Sector.objects.filter(enterprise=enterprise, name=name).exists():
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Setor com mesmo nome já existente para a empresa. Tente com outro nome."
                    }}
            return res 

        sector = Sector(
            name = name,
            image = image,
            manager = enterprise.owner,
            enterprise = enterprise            
        )
        sector.save()
        
        return Response(
            {"Data": 
                { 
                    "sucesso": True,
                    "mensagem": "Setor criado."
            }}, status=200)
    
class ShowSectorView(APIView):
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

        data = {
            "name": sector.name,
            "manager": sector.manager.name,
            "image": sector.image,
            "created_at": sector.creation_date,
            "works_at": sector.enterprise,
            "is_active": sector.is_active
        }
        
        res = Response()
        res.status_code=200
        res.data = data
        return res