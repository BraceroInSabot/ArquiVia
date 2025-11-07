from rest_framework.permissions import BasePermission
from apps.APISetor.models import SectorUser

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

        print(f"OBJETO: {obj}", f"TIPO: {type(obj)}")
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

        return False