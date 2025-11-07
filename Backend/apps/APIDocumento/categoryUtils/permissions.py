from rest_framework.permissions import BasePermission
from django.db.models import Q
from apps.APIEmpresa.models import Enterprise
from apps.APIDocumento.models import Category

class IsCategoryVisible(BasePermission):
    """
    Permissão que verifica se o usuário pode ver uma Categoria.
    A permissão é concedida se:
    1. A Categoria for pública (is_public=True).
    2. O usuário estiver vinculado à empresa da Categoria (dono, gerente ou membro).
    """
    message = "Você não tem permissão para visualizar esta categoria."

    def has_object_permission(self, request, view, obj):
        if obj.is_public:
            return True
        
        request_user = request.user
        enterprise = obj.category_enterprise

        is_linked = Enterprise.objects.filter(
            Q(pk=enterprise.pk) & (
                Q(owner=request_user) |
                Q(sectors__manager=request_user) |
                Q(sectors__sector_links__user=request_user)
            )
        ).exists()
        
        return is_linked