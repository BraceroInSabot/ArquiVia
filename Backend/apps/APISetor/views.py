from typing import Union
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Sector, SectorUser, SectorReviewPolicy
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.utils import default_response
from .serializers import SectorCreateSerializer, SectorDetailSerializer, SectorReviewPolicySerializer, SectorUpdateSerializer
from .permissions import (
    IsEnterpriseOwner, 
    IsEnterpriseOwnerOrMember,
    IsEnterpriseOwnerOrSectorManager, 
    IsOwnerOrSectorMember, 
    IsSectorEnterpriseOwner, 
    IsOwnerManagerOrSectorAdmin,
    IsEnterpriseOwnerBySector)
from rest_framework import status


# Typing
from apps.APIUser.models import AbsUser as UserModel

USER = get_user_model()

class CreateSectorView(APIView):
    permission_classes = [IsAuthenticated, IsEnterpriseOwner]
    
    def post(self, request):
        """
        Create a new Sector. Set the logged user (onwer from enterprise_id) as manager.
        
        Args:
            request (dict): user request

        Returns:
            Response: HttpResponse with status and message
        """
        serializer = SectorCreateSerializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        
        sector = serializer.save()
        
        res: HttpResponse = Response()
        res.status_code = 201
        res.data = default_response(success=True, message="Setor criado com sucesso!", data=serializer.data)
        return res
        
class RetrieveSectorView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrSectorMember]
    
    def get(self, request, pk: int):
        """
        Retrieves the details of a single sector.

        The user must be authenticated and have permission to view the sector.
        Permission is granted if the user is the owner of the company to which
        the sector belongs, or if the user is a member of the sector.
        
        Args:
            request (Request): The user request object.
            pk (int): The primary key of the sector to retrieve.

        Returns:
            Response: HttpResponse with status and message
        """
        
        sector = Sector.objects.select_related('manager', 'enterprise').filter(pk=pk).first()

        if sector is None:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Setor não encontrado.")
            return res
        
        self.check_object_permissions(request, sector)

        serializer = SectorDetailSerializer(sector)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Setor recuperado com sucesso!", data=serializer.data)
        return res
    
class ListUserSectorsView(APIView): # Renamed for clarity
    """
    Retrieves a list of all sectors the requesting user is linked to,
    including their hierarchy level within each sector.

    Linkage includes being the enterprise owner, sector manager, or sector member.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> HttpResponse:
        request_user = request.user

        user_sector_links = SectorUser.objects.filter(user=request_user).select_related(
            'sector', 
            'sector__manager', 
            'sector__enterprise__owner'
        )
        
        linked_sectors_data = {
            link.sector: {'is_adm': link.is_adm} 
            for link in user_sector_links
        } # todos os vinculos onde o usuário é membro e /ou administrador do setor
        linked_sector_ids = [sector.pk for sector in linked_sectors_data.keys()] 

        managed_sectors = Sector.objects.filter(manager=request_user).select_related(
            'enterprise__owner'
        ).exclude(pk__in=linked_sector_ids)  # não retorna os setores onde o usuário é adm
        managed_sector_ids = [sector.pk for sector in managed_sectors]

        owned_enterprise_ids = Enterprise.objects.filter(owner=request_user).values_list('pk', flat=True) # todos os ids de empresas que o usuário é dono
        
        owner_sectors = Sector.objects.filter(
            enterprise__pk__in=owned_enterprise_ids
        ).select_related('manager', 'enterprise__owner').exclude(
            pk__in=linked_sector_ids + managed_sector_ids
        ) # todos os setores onde o usuário é dono da empresa, mas não é gestor nem membro

        all_relevant_sectors = list(linked_sectors_data.keys()) + list(managed_sectors) + list(owner_sectors)
        
        unique_sectors = {sector.pk: sector for sector in all_relevant_sectors}.values()

        serializer_data = []
        for sector in unique_sectors:
            hierarchy = "Membro" 
            
            if sector.enterprise.owner == request_user:
                hierarchy = "Proprietário"
            elif sector.manager == request_user:
                hierarchy = "Gestor"
            elif sector in linked_sectors_data and linked_sectors_data[sector]['is_adm']:
                 hierarchy = "Administrador"
            
            sector_data = SectorDetailSerializer(sector).data
            sector_data['hierarchy_level'] = hierarchy # type: ignore
            serializer_data.append(sector_data)
            
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True, 
            message="Lista de setores recuperada com sucesso!", 
            data=serializer_data
        )
        return res
    
class ActivateOrDeactivateSectorView(APIView):
    permission_classes = [IsAuthenticated, IsSectorEnterpriseOwner]
    
    def put(self, request, pk: int):      
        
        sector = get_object_or_404(Sector.objects.select_related('enterprise__owner'), pk=pk)
        
        self.check_object_permissions(request, sector)

        sector.is_active = not sector.is_active  #type: ignore
        sector.save()  #type: ignore

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True, 
            message=f"Setor {'ativado' if sector.is_active else 'desativado'} com sucesso.",  #type: ignore
            data={"is_active": sector.is_active})  #type: ignore
        return res

class EditSectorView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerManagerOrSectorAdmin]
    
    def put(self, request, pk: int):
        name = request.data.get("name")
        image = request.data.get("image")
        
        sector = get_object_or_404(Sector, pk=pk)
        
        self.check_object_permissions(request, sector)
        
        update_serializer = SectorUpdateSerializer(
            instance=sector,
            data=request.data,
            partial=True
        )        
        update_serializer.is_valid(raise_exception=True)
             
        updated_sector = update_serializer.save()
        
        response_serializer = SectorDetailSerializer(updated_sector)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Setor Atualizado!", data=response_serializer.data)
        return res
    
class ExcludeSectorView(APIView):
    permission_classes = [IsAuthenticated, IsEnterpriseOwnerBySector]
    
    def delete(self, request, pk: int): 
        sector = get_object_or_404(Sector.objects.select_related('enterprise__owner'), pk=pk)
        
        self.check_object_permissions(request, sector)
        
        sector_name: str = sector.name
        sector.delete()

        res = Response()
        res.status_code = 200
        res.data = default_response(success=True, message=f"Setor {sector_name} deletado com sucesso.") 
        return res

class SectorReviewDateView(APIView):
    permission_classes = [IsAuthenticated, IsEnterpriseOwnerOrSectorManager]
    
    def put(self, request, pk: int):
        sector = get_object_or_404(Sector, pk=pk)
        self.check_object_permissions(request, sector)
        
        review_date: int = request.data.get("days")
        is_active: bool = request.data.get("is_active", True)
        
        if review_date is None:
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="A data de revisão é obrigatória.")
            return res
        
        if not isinstance(review_date, int) or review_date < 0:
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="A data de revisão deve ser um número inteiro positivo.")
            return res
        
        revision_policy = SectorReviewPolicy.objects.get_or_create(sector=sector)[0]
        
        print(revision_policy)
        
        if revision_policy.days == review_date:
            pass
        else:
            revision_policy.days = review_date
            revision_policy.save()
        
        revision_policy.is_active = is_active
        revision_policy.save()
        
        serializer = SectorDetailSerializer(sector)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Data de revisão atualizada com sucesso!", data=serializer.data)
        return res
    
    def get(self, request, pk: int):
        sector = get_object_or_404(Sector, pk=pk)
        self.check_object_permissions(request, sector)
        
        try:
            revision_policy = SectorReviewPolicy.objects.get(sector=sector)
            
            serialized_data = SectorReviewPolicySerializer(revision_policy)

            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(success=True, message="Política de revisão recuperada com sucesso!", data=serialized_data.data)
            return res
        except SectorReviewPolicy.DoesNotExist:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Política de revisão não encontrada para este setor.")
            return res