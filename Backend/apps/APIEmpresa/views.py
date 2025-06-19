from django.shortcuts import render
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Enterprise

class CreateEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        name = request.data.get("name")
        owner = request.user
        image = request.data.get("image")

        try:
            ent = Enterprise(
                name=name,
                image=image,
                owner=owner
            )
            ent.save()
        except:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Erro ao completar a operação, tente novamente."
                    }}
            return res
    

        return Response(
            {"Data": 
                        { 
                            "sucesso": True,
                            "mensagem": "Empresa criada com sucesso!"
                    }}, status=200)

class ShowEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        ent_id = request.data.get("enterprise_id")
        request_user = request.user

        try:
            ent = Enterprise.objects.get(ent_id=ent_id)
            print(ent)
        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Empresa não encontrada"
                    }}
            return res

        # TODO: Validar se o usuário faz parte do setor OU se é dono da empresa
        if not (Enterprise.objects.filter(owner=request_user).first() and ent.is_active):
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário sem permissão."
                    }}
            return res


        data = {
            "name": ent.name,
            "image": ent.image,
            "owner": ent.owner.name,
            "active": ent.is_active
        }

        res = Response()
        res.status_code=200
        res.data = data
        return res
    
class ListEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        request_user = request.user

        try:
            ent = Enterprise.objects.filter(owner=request_user)
        except Enterprise.DoesNotExist:
            return Response({
                "Data": {
                    "sucesso": False,
                    "mensagem": "Erro ao listar empresas."
                }
            }, status=400)

        data = {
            "Data": [
                {
                    "name": x.name,
                    "image": x.image,
                    "owner": x.owner.name,
                    "active": x.is_active,
                    "creation_date": x.created_at.strftime("%H:%M - %d/%m/%Y")
                }
                for x in ent
            ]
        }

        return Response(data, status=200)