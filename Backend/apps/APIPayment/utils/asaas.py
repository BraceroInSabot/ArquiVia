import requests
from django.conf import settings
from apps.APIUser.models import AbsUser as User
from apps.APIPayment.models import Plan_Status
from django.utils import timezone
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv(".env")

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
            "phoneMobile": user.phone_mobile,
            "externalReference": str(user.pk)
        }
        
        data = self._request("POST", "customers", payload)            
        return data["id"] # Retorna 'cus_xxxxx'

    def create_subscription(
        self, 
        customer_id: str | None, 
        plan_type, 
        plan,
        discount: float,
        discount_type: str,
    ):
        """
        Create a monthly subscription to be payed in payment slip or Pix (easier to start).
        """
        trial_days = plan_type.free_trial_days
        
        if trial_days is not None and plan.is_free_trial:
            first_payment_date = timezone.now() + timedelta(days=trial_days)
            formatted_date = first_payment_date.strftime("%Y-%m-%d")
            plan.status = Plan_Status.objects.get(plan_status='Ativo')
            plan.next_due_date = formatted_date
            print(formatted_date)
            plan.save()
        else:
            formatted_date = timezone.now().strftime("%Y-%m-%d")

        print(os.getenv('ASAAS_REDIRECT_URL_DEV'))
        base_url = os.getenv('ASAAS_REDIRECT_URL_DEV') if settings.DEBUG else "https://www.arquivia.bracero.com.br"    
            
        payload = {
            "customer": customer_id,
            "billingType": "UNDEFINED",
            "value": float(plan_type.price),
            "nextDueDate": formatted_date, # Lógica para D+3 ou similar
            "cycle": "MONTHLY",
            "description": f"{'[DEV]' if settings.DEBUG else ''}Assinatura ArquiVia Pro",
            "callback": {
                "successUrl": f"{base_url}/painel",
                "autoRedirect": False
            }
        }
        
        if discount > 0:
            payload["discount"] = {
                "value": discount,
                "dueDateLimitDays": 0,
                "type": discount_type
            }
        
        print(f"Assinatura criada.\nVencimento: {formatted_date} && CustomerId: {customer_id}\nPayload: {payload}")
        
        data = self._request("POST", "subscriptions", payload)
        return data
    
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
    