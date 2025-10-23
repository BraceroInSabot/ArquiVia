

from rest_framework.permissions import BasePermission
from apps.APIEmpresa.models import Enterprise

class IsLinkedtoEnterprise(BasePermission):
    """
    Custom permission to only allow users linked to any sector within an enterprise
    to access that enterprise's resources.
    """
    message = "Você não tem permissão para acessar os recursos desta empresa."

    def has_object_permission(self, request, view, obj):
        is_linked = obj.sectors.filter(sector_links__user=request.user).exists()  # type: ignore
        is_manager = obj.sectors.filter(manager=request.user).exists()  # type: ignore
        is_owner = obj.owner == request.user

        return is_owner or is_manager or is_linked

