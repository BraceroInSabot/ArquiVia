from rest_framework.permissions import BasePermission
from apps.APIDocumento.models import Document
from apps.APISetor.models import Sector, SectorUser

class IsLinkedToDocument(BasePermission):
    """
    Permissão que concede acesso se o usuário for:
    1. O criador do documento.
    2. O gerente do setor do documento.
    3. Um membro do setor do documento.
    4. O dono da empresa do setor do documento.
    """
    message = "Você não tem permissão para acessar este documento."

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not obj.sector:
            return obj.creator == user

        if obj.creator == user:
            return True

        if obj.sector.enterprise.owner == user:
            return True

        if obj.sector.manager == user:
            return True
        
        if SectorUser.objects.filter(user=user, sector=obj.sector).exists():
            return True
        
        if obj.classification.privacity.privacity == 'Público':
            return True

        return False
    
class CanAttachDocument(BasePermission):
    """
    Permissão que concede acesso se o usuário for:
    1. O dono da empresa do setor.
    2. O gerente do setor.
    3. Um membro do setor.
    4. Se o documento for público, verifica se o usuário pertence à empresa.
    """
    
    message = "Você não tem permissão para anexar arquivos a este documento."
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        is_owner = obj.sector.enterprise.owner == user
        is_manager = obj.sector.manager == user
        is_sector_member = obj.sector.sector_links.filter(user=user).exists()
        
        if obj.classification.privacity.privacity == 'Público':
            document_enterprise = obj.sector.enterprise
            member_link = SectorUser.objects.filter(user=user, sector__enterprise=document_enterprise).exists()
            manager_link = Sector.objects.filter(manager=user, enterprise=document_enterprise).exists()
            owner_link = Sector.objects.filter(enterprise__owner=user, enterprise=document_enterprise).exists()
            
            is_enterprise_member = member_link or manager_link or owner_link
        
        if is_owner or is_manager or is_sector_member or is_enterprise_member:
            return True
        
        return False

class CanActivateOrDeactivateDocument(BasePermission):
    message = "Você não tem permissão para ativar ou desativar este documento."
    
    def has_object_permission(self, request, view,  obj):
        if not isinstance(obj, Document):
             return False

        is_owner = obj.sector.enterprise.owner == request.user # type: ignore
        is_manager = obj.sector.manager == request.user # type: ignore
        is_adm = SectorUser.objects.filter(
            is_adm=True, 
            sector=obj.sector,
            user=request.user
        ).exists()
        
        return is_owner or is_manager or is_adm
    
class CanDELETEDocument(BasePermission):
    message = "Você não tem permissão para deletar este documento."
    
    def has_object_permission(self, request, view,  obj):
        if not isinstance(obj, Document):
             return False
         
        is_owner = obj.sector.enterprise.owner == request.user # type: ignore
        is_manager = obj.sector.manager == request.user # type: ignore
        
        return is_owner or is_manager
    