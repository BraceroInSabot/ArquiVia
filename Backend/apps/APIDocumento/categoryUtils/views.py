from django.contrib.auth import get_user_model
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Classification_Category, Document, Category
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise

User = get_user_model()

class CreateCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user: Type[User] = request.user #type: ignore
        titulo: str = request.data.get('titulo')
        descricao: str = request.data.get('descricao')
        codigo_setor: str = request.data.get('codigo_setor')
        codigo_classificacao: str = request.data.get('codigo_classificacao')
        
        if len(titulo) < 3 or len(titulo) > 100:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Setor não encontrado."
                }
            }
            return ret
        
        if len(descricao) > 1000:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você ultrapassou o limite de caracteres para a descrição. Reformule o texto e tente novamente."
                }
            }
            return ret

        try:
            setor: Type[Sector] = Sector.objects.get(sector_id=codigo_setor) #type: ignore
            vinculo: Type[SectorUser] = SectorUser.objects.filter(user=user, sector=setor).first() #type: ignore
        except Sector.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Setor não encontrado."
                }
            }
            return ret
        
        
        # print(not vinculo.is_adm, setor.manager != user, Enterprise.objects.get(owner=user) != setor.enterprise, vinculo is None)
        if  setor.manager != user and Enterprise.objects.get(owner=user) != setor.enterprise and vinculo is None: #type: ignore
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para criar categorias nesse setor."
                }
            }
            
            if not vinculo.is_adm:
                return ret
                

        try:
            category_object = Category.objects.create(
                category=titulo,
                description=descricao,
                category_sector=setor,
                category_enterprise=setor.enterprise
            ) #type: ignore
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Ocorreu um erro ao criar a categoria. Tente novamente mais tarde."
                }
            }
            return ret
        
        category_object.save()
        
        ret = Response()
        ret.status_code = 201
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Categoria criada com sucesso."
            }
        }
        return ret
    
class ShowCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        category_id = request.data.get('category_id')
        user = request.user
        
        try:
            category: Type[Category] = Category.objects.get(category_id=category_id) #type: ignore
        except Category.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Categoria não encontrada."
                }
            }
            return ret

        try:
            vinculo: Type[SectorUser] = SectorUser.objects.filter(user=user, sector=category.category_sector).first() #type: ignore
        except SectorUser.DoesNotExist:
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para visualizar essa categoria."
                }
            }
        
        try:
            if vinculo is None and category.category_sector.manager != user and Enterprise.objects.get(owner=user) != category.category_enterprise: #type: ignore
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para visualizar essa categoria."
                    }
                }
                return ret
        except:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para visualizar essa categoria."
                }
            }
            return ret
        
        data = {
            "category_id": category.category_id,
            "titulo": category.category,
            "descricao": category.description,
            "setor": {
                "sector_id": category.category_sector.sector_id,
                "sector_name": category.category_sector.name
            } if category.category_sector else None,
            "empresa": {
                "enterprise_id": category.category_enterprise.ent_id,
                "enterprise_name": category.category_enterprise.name
            } if category.category_enterprise else None
        }
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": data
            }
        }
        return ret