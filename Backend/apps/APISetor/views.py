from typing import Union
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.utils import default_response
from .serializers import SectorCreateSerializer, SectorDetailSerializer, SectorListSerializer, SectorUpdateSerializer
from .permissions import (
    IsEnterpriseOwner, 
    IsEnterpriseOwnerOrMember, 
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
    
class ListSectorView(APIView):
    permission_classes = [IsAuthenticated, IsEnterpriseOwnerOrMember]
    
    def get(self, request, pk: int):
        """
        Retrieves a list of sectors belonging to a specific enterprise.

        The user must be authenticated and either the owner of the enterprise
        or a member of a sector within that enterprise to view the list.
        If the user is the owner, all sectors are returned.
        If the user is a member, only the active sectors they belong to are returned.
        
        Args:
            request (Request): The user request object.
            pk (int): The primary key of the sector to retrieve.

        Returns:
            Response: HttpResponse with status and message
        """
        enterprise_check = Enterprise.objects.filter(pk=pk).first()
        
        if enterprise_check is None:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Empresa não encontrada.")
            return res

        self.check_object_permissions(request, enterprise_check)

        if enterprise_check.owner == request.user:
            sectors_queryset = enterprise_check.sectors.all()  #type: ignore
        else:
            sectors_queryset = Sector.objects.filter(
                enterprise=enterprise_check, 
                sector_links__user=request.user,
                is_active=True
            )
        
        optimized_queryset = sectors_queryset.select_related('manager').distinct()

        serializer = SectorListSerializer(optimized_queryset, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Lista de setores recuperada com sucesso!", data=serializer.data)
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
