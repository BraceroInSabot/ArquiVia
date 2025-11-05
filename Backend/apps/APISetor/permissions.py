

from rest_framework.permissions import BasePermission
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import SectorUser, Sector


class IsEnterpriseOwner(BasePermission):
    """
    Permissão que verifica se o usuário da requisição é o dono da empresa
    especificada no payload.
    """
    message = "Você não é o proprietário desta empresa e não pode criar setores nela."

    def has_permission(self, request, view):
    
        enterprise_id = int(request.data.get('enterprise_id'))
        
        if not enterprise_id or not isinstance(enterprise_id, int):
            self.message = "O campo 'enterprise_id' (ID da empresa) é obrigatório e deve ser um número."
            return False

        try:
            enterprise = Enterprise.objects.get(pk=enterprise_id)
            return enterprise.owner == request.user
        except Enterprise.DoesNotExist:
            self.message = f"A empresa com o ID {enterprise_id} não foi encontrada."
            return False
        
class IsOwnerOrSectorMember(BasePermission):
    """
    Permissão customizada que concede acesso se o usuário for o dono da empresa
    ou um membro do setor.
    """
    message = "Você não tem permissão para acessar este setor."

    def has_object_permission(self, request, view, obj):        
        is_owner = obj.enterprise.owner == request.user
        is_manager = Sector.objects.filter(manager=request.user, sector_id=obj.sector_id).exists()
        is_member = SectorUser.objects.filter(user=request.user, sector=obj).exists()
        
        return is_owner or is_member or is_manager
    
class IsEnterpriseOwnerOrMember(BasePermission):
    """
    Custom permission to only allow enterprise owners or members 
    of any sector within that enterprise to access related resources.
    """
    message = "Você não tem permissão para acessar os recursos desta empresa."

    def has_object_permission(self, request, view, obj):
        is_owner = obj.owner == request.user
        
        is_member = SectorUser.objects.filter(
            user=request.user, 
            sector__enterprise=obj
        ).exists()
        
        return is_owner or is_member

class IsSectorEnterpriseOwner(BasePermission):
    """
    Custom permission to only allow the owner of the enterprise
    to which the sector belongs to modify the sector.
    """
    message = "Você não tem permissão para modificar este setor."

    def has_object_permission(self, request, view, obj):
        return obj.enterprise.owner == request.user
    
class IsOwnerManagerOrSectorAdmin(BasePermission):
    """
    Custom permission to grant access if the user is the enterprise owner,
    the direct manager of the sector, or an admin member of the sector.

    Assumes the object being checked (`obj`) is an instance of the `Sector` model.
    """
    message = "Você não tem permissão para modificar este setor"
    
    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, Sector):
             return False

        is_owner = obj.enterprise.owner == request.user
        is_manager = obj.manager == request.user    
        is_adm = SectorUser.objects.filter(
            is_adm=True, 
            sector=obj,
            user=request.user
        ).exists()
    
        return is_owner or is_manager or is_adm
    
class IsEnterpriseOwnerBySector(BasePermission):
    """
    Permissão que verifica se o usuário da requisição é o dono da empresa
    especificada no payload.
    """
    message = "Você não é o proprietário desta empresa e não pode criar setores nela."

    def has_object_permission(self, request, view, obj):        
        if not isinstance(obj, Sector):
             return False
         
        is_owner = obj.enterprise.owner == request.user

        if not is_owner:
            self.message = "Apenas o proprietário da empresa pode realizar esta ação neste setor."
            
        if is_owner:
            return True
        
class IsEnterpriseOwnerOrSectorManager(BasePermission):
    """
    Permissão que verifica se o usuário da requisição é o dono da empresa
    ou o gerente do setor especificado no payload.
    """
    message = "Você não é o proprietário desta empresa ou o gerente deste setor."

    def has_object_permission(self, request, view, obj):        
        if not isinstance(obj, Sector):
             return False
         
        is_owner = obj.enterprise.owner == request.user
        is_manager = obj.manager == request.user

        if not (is_owner or is_manager):
            self.message = "Apenas o proprietário da empresa ou o gerente do setor podem realizar esta ação."
            
        if is_owner or is_manager:
            return True
        
class IsLinkedToSector(BasePermission):
    """
    Permissão que verifica se o usuário da requisição está vinculado
    ao setor especificado no payload.
    """
    message = "Você não está vinculado a este setor."

    def has_object_permission(self, request, view, obj):        
        if not isinstance(obj, Sector):
             return False
         
        is_linked = SectorUser.objects.filter(
            user=request.user,
            sector=obj
        ).exists()

        is_manager = obj.manager == request.user
        is_owner = obj.enterprise.owner == request.user
        
        if not is_linked:
            self.message = "Apenas usuários vinculados ao setor podem realizar esta ação."
            
        if is_linked or is_manager or is_owner:
            return True