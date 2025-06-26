from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Enterprise
from django.http import HttpResponse

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
                            "mensagem": "Usuário sem permissão para completar a operação."
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

        # TODO: Validar se o usuário faz parte do setor OU se é dono da empresa
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
    
class EditEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request: dict):
        ent_id = request.data.get("ent_id")
        name = request.data.get("name")
        image = request.data.get("image")
        request_user = request.user
        
        try:
            enterprise = Enterprise.objects.filter(ent_id=ent_id).first()
        except:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Houve um erro na busca pela empresa. Tente novamente."
                    }}
            return res
        
        # TODO: Validar se o usuário faz parte do setor OU se é dono da empresa
        if not (Enterprise.objects.filter(owner=request_user).first() and enterprise.is_active):
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário sem permissão."
                    }}
            return res

        enterprise.name = name
        enterprise.image = image
        enterprise.save()
        
        res = Response()
        res.status_code=200
        res.data = {"Data": 
                    { 
                        "sucesso": True,
                        "mensagem": "Alteração realizada com sucesso!"
                }}
        return res
        
class ActivateOrDeactivateEnterpriseVIew(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        ent_id = request.data.get("enterprise_id")
        request_user = request.user
        
        try:
            enterprise = Enterprise.objects.filter(ent_id=ent_id).first()
        except:
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Houve um erro na busca pela empresa. Tente novamente."
                    }}
            return res
        
        # TODO: Validar se o usuário faz parte do setor OU se é dono da empresa
        if not (Enterprise.objects.filter(owner=request_user).first()):
            res = Response()
            res.status_code=400
            res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário sem permissão."
                    }}
            return res
        
        enterprise.is_active = True if not enterprise.is_active else False
        
        enterprise.save()
        
        res = Response()
        res.status_code=200
        res.data = {"Data": 
                    { 
                        "sucesso": True,
                        "mensagem": f"{'Empresa ativada' if enterprise.is_active else 'Empresa desativada'} com sucesso!"
                }}
        return res   

class ExcludeEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        ent_id = request.data.get("enterprise_id")
        request_user = request.user
        
        print(ent_id)

        try:
            enterprise = Enterprise.objects.filter(ent_id=ent_id).first()
        except Exception:
            return Response({
                "Data": {
                    "sucesso": False,
                    "mensagem": "Houve um erro na busca pela empresa. Tente novamente."
                }
            }, status=400)
        
        if not enterprise:
            return Response({
                "Data": {
                    "sucesso": False,
                    "mensagem": "Empresa não encontrada."
                }
            }, status=404)
        
        if enterprise.owner != request_user:
            return Response({
                "Data": {
                    "sucesso": False,
                    "mensagem": "Usuário sem permissão."
                }
            }, status=403)
        
        name = enterprise.name
        enterprise.delete()
        
        return Response({
            "Data": {
                "sucesso": True,
                "mensagem": f"Empresa >> {name} << excluída."
            }
        }, status=200)