from rest_framework.permissions import BasePermission
from apps.APIEmpresa.models import Enterprise

class IsEnterpriseOwner(BasePermission):
    """
    Permissão que verifica se o usuário da requisição é o dono da empresa
    especificada no payload.
    
    Returns:
        bool: True se o usuário é o dono da empresa, False caso contrário.
    """
    def has_permission(self, request, view):
        enterprise_id = request.data.get('enterprise_id')
        if not enterprise_id:
            return False

        try:
            enterprise = Enterprise.objects.get(pk=enterprise_id)
            return enterprise.owner == request.user
        except Enterprise.DoesNotExist:
            return False 