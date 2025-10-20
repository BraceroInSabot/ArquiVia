# Em APISetor/permissions.py

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
        # --- CORREÇÃO AQUI ---
        # Procurar por 'enterprise', o mesmo nome do campo no serializer.
        enterprise_id = request.data.get('enterprise_id')
        
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