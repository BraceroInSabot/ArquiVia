from django.contrib.auth import get_user_model
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
        user: Type[User] = request.user #type: ignore
        titulo: str = request.data.get('titulo')
        descricao: str = request.data.get('descricao')
        codigo_setor: str = request.data.get('codigo_setor')
        
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
        
        try: 
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
        except Enterprise.DoesNotExist:
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para criar categorias nesse setor."
                }
            }
            return ret
        except:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Ocorreu um erro ao criar a categoria. Tente novamente mais tarde."
                }
            }
                

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
                "sector_id": category.category_sector.sector_id, #type: ignore
                "sector_name": category.category_sector.name #type: ignore
            } if category.category_sector else None,
            "empresa": {
                "enterprise_id": category.category_enterprise.ent_id, #type: ignore
                "enterprise_name": category.category_enterprise.name #type: ignore
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

class ListCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        authority_level: bool = request.data.get('authority_level')
        
        category_list = []
        category = []
        
        base_queryset = Category.objects.select_related('category_sector', 'category_enterprise')
        print(authority_level)
        
        if authority_level:
            queryset = base_queryset.filter(
                Q(category_enterprise__owner=user) | Q(category_sector__manager=user)
            ).distinct()
        else:
            user_sectors = SectorUser.objects.filter(user=user).values_list('sector_id', flat=True)
            queryset = base_queryset.filter(category_sector__sector_id__in=user_sectors)
        
        try:
            category_list = []
            for c in queryset:
                category_data = {
                    "category_id": c.category_id,
                    "titulo": c.category,
                    "descricao": c.description,
                    "setor": None,
                    "empresa": None
                }
                if c.category_sector:
                    category_data["setor"] = {
                        "sector_id": c.category_sector.sector_id,
                        "sector_name": c.category_sector.name
                    }
                if c.category_enterprise:
                    category_data["empresa"] = {
                        "enterprise_id": c.category_enterprise.ent_id,
                        "enterprise_name": c.category_enterprise.name
                    }
                category_list.append(category_data)
        except (Enterprise.DoesNotExist, SectorUser.DoesNotExist):
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Nenhuma categoria encontrada."
                }
            }
            return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Ocorreu um erro ao listar as categorias. Tente novamente mais tarde {e}."
                }
            }
            return ret
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": category_list
            }
        }
        return ret  

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