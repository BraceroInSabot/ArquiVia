from rest_framework.permissions import IsAuthenticated
from .models import Plan, Plan_Subscription_Item, Plan_Type
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plan
from .utils.asaas import AsaasService
from apps.core.utils import default_response
from django.conf import settings
from .serializers import PlanDashboardSerializer, Plan_Type_Serializer


if settings.DEBUG:
    from .dev.views import *
    
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
            sub_data = service.create_subscription(plan.asaas_customer_id) # type: ignore
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

class PlanDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        try:
            plan = Plan.objects.select_related('plan_type', 'status')\
                               .prefetch_related('items')\
                               .get(user=user)
            
            serializer = PlanDashboardSerializer(plan)
            res = Response()
            res.status_code = 200
            res.data = default_response(
                success=True,
                data=serializer.data
            )
            return res

        except Plan.DoesNotExist:
            res = Response()
            res.status_code = 200
            res.data = default_response(
                success=True,
                data={'has_plan': False} # type: ignore
            )
            return res
        
class PlansRetrievalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        try:
            plan_types = Plan_Type.objects.filter(is_active=True)
            
            serializer = Plan_Type_Serializer(plan_types, many=True)
            res = Response()
            res.status_code = 200
            res.data = default_response(
                success=True,
                data=serializer.data
            )
            return res
        
        except Plan_Type.DoesNotExist:
            res = Response()
            res.status_code = 200
            res.data = default_response(
                success=True,
                data={'has_plan': False} # type: ignore
            )
            return res
        