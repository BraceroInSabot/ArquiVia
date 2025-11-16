from rest_framework.permissions import BasePermission
from apps.APISetor.models import Sector

class IsSectorManagerOrOwner(BasePermission):
    """
    Permite acesso apenas se o usuário for:
    1. O Gerente (manager) do Setor que está sendo visualizado.
    2. O Dono (owner) da Empresa à qual o Setor pertence.
    """
    message = "Você deve ser o gerente deste setor ou o dono da empresa para ver este dashboard."

    def has_object_permission(self, request, view, obj):
        # O 'obj' que a view passará é o 'Sector'
        if not isinstance(obj, Sector):
            return False
            
        user = request.user
        
        # 1. Verifica se é o Gerente do Setor
        if obj.manager == user:
            return True
            
        # 2. Verifica se é o Dono da Empresa
        #    (O 'obj.enterprise' é puxado pelo select_related na view)
        if obj.enterprise.owner == user:
            return True
            
        return False
    
