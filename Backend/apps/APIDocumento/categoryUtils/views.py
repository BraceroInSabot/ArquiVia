from django.contrib.auth import get_user_model
from django.http import HttpResponse
from apps.APIDocumento.permissions import IsLinkedToDocument
from apps.core.utils import default_response
from apps.APIDocumento.categoryUtils.serializers import CategoryListSerializer, CreateCategorySerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Document, Category
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.db.models import Q

User = get_user_model()

class CreateCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        serializer = CreateCategorySerializer(
            data=request.data, 
            context={'request': request}
        )
        
        serializer.is_valid(raise_exception=True)
        
        category_created = serializer.save()
        
        ret = Response()
        ret.status_code = 201
        ret.data = default_response(success=True, message="Categoria criada com sucesso!", data={"category_id": category_created.category_id}) # type: ignore
        return ret
    
class ListCategoryView(APIView):
    """
    Recupera uma lista de todas as Categorias visíveis para o usuário.

    Um usuário pode ver uma Categoria se:
    1. A Categoria for pública (is_public=True).
    2. A Categoria pertencer a uma Empresa à qual o usuário está vinculado
       (seja como dono, gerente de setor ou membro de setor).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> HttpResponse:
        """
        Manipula a requisição GET para listar as categorias filtradas.

        Args:
            request (Request): O objeto da requisição do usuário.

        Returns:
            HttpResponse: Uma resposta contendo a lista de categorias.
        """
        request_user = request.user

        linked_enterprise_ids = Enterprise.objects.filter(
            Q(owner=request_user) |
            Q(sectors__manager=request_user) |
            Q(sectors__sector_links__user=request_user)
        ).values_list('pk', flat=True).distinct()

        category_query = (
            Q(is_public=True) |
            Q(category_enterprise__pk__in=linked_enterprise_ids)
        )

        categories_queryset = Category.objects.filter(category_query).select_related(
            'category_enterprise', 
            'category_sector'
        ).distinct()

        serializer = CategoryListSerializer(categories_queryset, many=True)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Lista de categorias recuperada com sucesso.", data=serializer.data)
        return res

class UpdateCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user: Type[User] = request.user #type: ignore
        category_id: str = request.data.get('category_id')
        title: str = request.data.get('title')
        description: str = request.data.get('description')
        
        if len(title) < 3 or len(title) > 100:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "O título deve ter entre 3 e 100 caracteres."
                }
            }
            return ret
        
        if len(description) > 1000:
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
            setor: Type[Sector] = category.category_sector #type: ignore
            if  setor.manager != user and Enterprise.objects.get(owner=user) != setor.enterprise and vinculo is None: #type: ignore
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para editar essa categoria."
                    }
                }
                
                if not vinculo.is_adm:
                    return ret
        except Enterprise.DoesNotExist:
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para editar essa categoria."
                }
            }
            return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Ocorreu um erro ao editar a categoria. Tente novamente mais tarde {e}."
                }
            }
            return ret
        
        try:
            category.category = title
            category.description = description
            category.save()
            
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Ocorreu um erro ao editar a categoria. Tente novamente mais tarde."
                }
            }
            return ret
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Categoria editada com sucesso."
            }
        }
        return ret
    
class DeleteCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user: Type[User] = request.user #type: ignore
        category_id: str = request.data.get('category_id')
        
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
            setor: Type[Sector] = category.category_sector #type: ignore
            if  setor.manager != user and Enterprise.objects.get(owner=user) != setor.enterprise and vinculo is None: #type: ignore
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para deletar essa categoria."
                    }
                }
                
                if not vinculo.is_adm:
                    return ret
        except Enterprise.DoesNotExist:
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para deletar essa categoria."
                }
            }
            return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Ocorreu um erro ao deletar a categoria. Tente novamente mais tarde {e}."
                }
            }
            return ret
        
        try:
            category.delete()
            
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Ocorreu um erro ao deletar a categoria. Tente novamente mais tarde."
                }
            }
            return ret
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Categoria deletada com sucesso."
            }
        }
        return ret