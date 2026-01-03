# apps/financas/views.py (Exemplo simplificado)
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plan
from .utils.asaas import AsaasService
from apps.core.utils import default_response

class CreateCheckoutView(APIView):
    def post(self, request):
        user = request.user
        service = AsaasService()

        plan, created = Plan.objects.get_or_create(user=user)
        
        if not plan.asaas_customer_id:
            customer_id = service.create_customer(user)
            plan.asaas_customer_id = customer_id
            plan.save()

        if not plan.asaas_subscription_id:
            sub_data = service.create_subscription(plan.asaas_customer_id)
            plan.asaas_subscription_id = sub_data['id']
            plan.save()
            
            res = Response()
            res.status_code = 201
            res.data = default_response(
                success=True,
                message="Plan criada com sucesso",
                data={
                    "subscription_id": sub_data['id']
                }
            )
            return res

        res = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message="Plano de assinatura já existente",
            data={
                "subscription_id": plan.asaas_subscription_id
            }
        )
        return res