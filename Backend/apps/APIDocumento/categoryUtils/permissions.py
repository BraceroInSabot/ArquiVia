from rest_framework.permissions import BasePermission
from django.db.models import Q
from apps.APISetor.models import SectorUser
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
    
class IsCategoryEditor(BasePermission):
    """
    Concede permissão para editar uma Categoria se o usuário for:
    1. O Dono da Empresa à qual a Categoria pertence.
    2. O Gestor do Setor ao qual a Categoria está vinculada.
    3. Um Administrador do Setor ao qual a Categoria está vinculada.
    """
    message = "Você não tem permissão para modificar esta categoria."

    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, Category):
            return False

        user = request.user

        if obj.category_enterprise.owner == user:
            return True

        if not obj.category_sector:
            return False
            
        if obj.category_sector.manager == user:
            return True
        
        if SectorUser.objects.filter(
            user=user,
            sector=obj.category_sector,
            is_adm=True
        ).exists():
            return True

        return False