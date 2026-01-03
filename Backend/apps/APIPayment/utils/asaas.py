import requests
from django.conf import settings

class AsaasService:
    def __init__(self):
        self.base_url = settings.ASAAS_API_URL
        self.headers = {
            "access_token": settings.ASAAS_API_KEY,
            "Content-Type": "application/json"
        }

    def _request(self, method, endpoint, data=None):
        url = f"{self.base_url}/{endpoint}"
        response = requests.request(method, url, headers=self.headers, json=data)
        
        if not response.ok:
            # Em produção, logue isso com Sentry/Logger
            print(f"Erro Asaas [{response.status_code}]: {response.text}")
            response.raise_for_status()
            
        return response.json()

    def create_customer(self, user):
        """Cria o cliente no Asaas se não existir"""
        # 1. Tenta achar pelo CPF/CNPJ ou Email primeiro para evitar duplicação
        # (Implementação simplificada)
        
        payload = {
            "name": user.name,
            "email": user.email,
            "cpfCnpj": user.cpf_cnpj,
            "externalReference": str(user.pk)
        }
        
        data = self._request("POST", "customers", payload)
        return data["id"] # Retorna 'cus_xxxxx'

    def create_subscription(self, customer_id, value=99.90):
        """Cria uma assinatura mensal no Boleto/Pix (mais simples pra começar)"""
        payload = {
            "customer": customer_id,
            "billingType": "UNDEFINED", # Deixa o usuário escolher no link (Pix/Boleto/Cartão)
            "value": value,
            "nextDueDate": "2026-02-01", # Lógica para D+3 ou similar
            "cycle": "MONTHLY",
            "description": "Assinatura ArquiVia Pro"
        }
        
        data = self._request("POST", "subscriptions", payload)
        return data # Retorna o objeto da assinatura completo
    
    def restore_customer(self, customer_id):
        """Restaura o cliente no Asaas se deletado (opcional)"""
        payload = {
            "id": customer_id
        }
        
        data = self._request("POST", f"customers/{customer_id}/restore", payload)
        return data
    
    def edit_customer(self, customer_id, update_data):
        """Edita os dados do cliente no Asaas"""
        data = self._request("PUT", f"customers/{customer_id}", update_data)
        return data
    