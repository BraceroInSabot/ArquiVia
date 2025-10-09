# DRF
from typing import Tuple, Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny

# DJANGO
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404 # Adicionar esta importação

# PROJECT
from .models import Enterprise
from .serializers import EnterpriseSerializer, EnterpriseToggleActiveSerializer
from apps.core.utils import default_response
from apps.APISetor.models import Sector, SectorUser

# TYPING
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Create a new Enterprise.

        Args:
            request (dict): user request

        Returns:
            Response: HttpResponse with status and message
        """
        name: str = request.data.get("name")
        owner: Type[User] = request.user # type: ignore

        serializer = EnterpriseSerializer(data=request.data)
        
        try:
            if serializer.is_valid():
                serializer.save(owner=owner)
                res: Type[HttpResponse] = Response() # type: ignore
                res.status_code=201
                res.data = default_response(success=True, message="Empresa criada com sucesso!", data=serializer.data) #type: ignore
                
                return res
        except:    
            res: Type[HttpResponse] = Response() # type: ignore
            res.status_code=400
            res.data = default_response(success=False, message="Erro ao criar empresa. Verifique os dados enviados.", data=serializer.errors) # type: ignore
            
            return res


class RetrieveEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        Retrieve a single enterprise data.

        Args:
            request (dict): user request 
            pk (int): enterprise primary key / code

        Returns:
            Response: HttpResponse with status and message
        """
        request_user: Type[User] = request.user # type: ignore

        try:
            ent = Enterprise.objects.get(enterprise_id=pk)
        except Enterprise.DoesNotExist:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Empresa não encontrada.")
            return res
        except:
            res: HttpResponse = Response()
            res.status_code = 500
            res.data = default_response(success=False, message="Houve um erro interno. Tente novamente.")
            return res

        is_owner: bool = ent.owner == request_user
        is_linked: bool = ent.enterprises.filter(sector_links__user=request_user).exists() # type: ignore

        if not (is_owner or is_linked):
            res = Response()
            res.status_code = 403
            res.data = default_response(success=False, message="Usuário sem permissão para completar a operação.") 
            return res

        serializer = EnterpriseSerializer(ent)

        res = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res

class ListEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retrieve many enterprises data wich are linked with the user.

        Args:
            request (dict): user request 

        Returns:
            Response: HttpResponse with status and message
        """
        request_user = request.user

        # Q -> Query
        query: Q = (
            # O usuário é dono da empresa?
            Q(owner=request_user) | 
            # O usuário é gerente de algum setor?
            Q(enterprises__manager=request_user) |
            # O usuário faz parte de algum setor relacionado à empresa?
            Q(enterprises__sector_links__user=request_user)
        )

        try:
            enterprises = Enterprise.objects.filter(query).prefetch_related('owner').distinct()

            serializer = EnterpriseSerializer(enterprises, many=True)
        except:
            res: HttpResponse = Response()
            res.status_code = 500
            res.data = default_response(success=False, message="Houve um erro interno. Tente novamente.")
            
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res
    
class EditEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        """
        Edit the selected enterprise data by its ID.
        
        Args:
            request (dict): user request 
            pk (int): enterprise primary key / code

        Returns:
            Response: HttpResponse with status and message
        """
        request_user = request.user
        
        try:
            enterprise = Enterprise.objects.get(enterprise_id=pk)

            if enterprise.owner != request_user:
                res = Response()
                res.status_code = 403
                res.data = default_response(success=False, message="Usuário sem permissão para editar esta empresa.")
                return res

            serializer = EnterpriseSerializer(enterprise, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                res = Response()
                res.status_code = 200
                res.data = default_response(success=True, message="Alteração realizada com sucesso!", data=serializer.data)
                return res
            
            res = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Dados inválidos.", data=serializer.errors)
            return res

        except Enterprise.DoesNotExist:
            res = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Empresa não encontrada.")
            return res
        except Exception as e:
            res = Response()
            res.status_code = 500
            res.data = default_response(success=False, message="Houve um erro interno. Tente novamente.")
            return res
        
class ActivateOrDeactivateEnterpriseVIew(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        """
        Alter the is_active attribute of object if User is the owner.

        Args:
            request (dict): user request 
            pk (int): enterprise primary key / code

        Returns:
            Response: HttpResponse with status and message
        """
        request_user = request.user
        
        try:
            enterprise: Enterprise = Enterprise.objects.get(owner=request.user, enterprise_id=pk) # type: ignore
        except:
            res: HttpResponse = Response()
            res.status_code=404
            res.data = default_response(success=False, message="Houve um erro na busca pela empresa. Tente novamente.") 
            
            return res
        
        try:
            enterprise.is_active = not enterprise.is_active
            enterprise.save()
        except:
            res = Response()
            res.status_code=400
            res.data = default_response(success=False, message="Houve erros internos. Tente novamente mais tarde.") 

            return res
        
        serializer = EnterpriseToggleActiveSerializer(enterprise)
        
        res: HttpResponse = Response()
        res.status_code=200
        res.data = default_response(success=True, message="Operação realizada!", data=serializer.data) 
        
        return res   

class ExcludeEnterpriseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, pk):
        """
        Exclude the enterprise if the user is the owner.

        Args:
            request (dict): user request 
            pk (int): enterprise primary key / code

        Returns:
            Response: HttpResponse with status and message
        """
        request_user = request.user

        try:
            enterprise = Enterprise.objects.get(owner=request_user, enterprise_id=pk)
        except Exception:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Houve um erro na busca pela empresa. Tente novamente.")
            
            return res
        
        try:
            enterprise.delete()
        except:
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Houve erros internos. Tente novamente mais tarde.")
            
            return res
            
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Empresa excluída permanentemente pelo dono.")
        
        return res