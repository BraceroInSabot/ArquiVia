# Em APISetor/permissions.py

from rest_framework.permissions import BasePermission
from apps.APIEmpresa.models import Enterprise

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