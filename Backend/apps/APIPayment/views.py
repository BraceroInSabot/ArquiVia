from rest_framework.permissions import IsAuthenticated
from .models import Plan, Plan_Subscription_Item, Plan_Type, Plan_Status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plan
from .utils.asaas import AsaasService
from apps.core.utils import default_response
from django.conf import settings
from .serializers import PlanDashboardSerializer, Plan_Type_Serializer
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector
from django.shortcuts import get_object_or_404
from django.db import transaction


if settings.DEBUG:
    from .dev.views import *
    
class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_type_id):
        user = request.user
        service = AsaasService()
        preferable_payment_day = request.data.get('preferable_payment_day')
        billing_cycle = request.data.get('billing_cycle')
        print(billing_cycle)

        if not plan_type_id:
            return Response(default_response(
                success=False, 
                message="ID do plano não fornecido."
            ), status=400)

        plan_type = get_object_or_404(Plan_Type, pk=plan_type_id, is_active=True)

        try:
            with transaction.atomic():
                has_active_plan = user.plans.filter(status__plan_status='Ativo').exists()
                
                if has_active_plan:
                    return Response(default_response(
                        success=False, 
                        message="Você já possui uma assinatura ativa. Gerencie sua assinatura atual no painel."
                    ), status=409)
                    
                last_plan = user.plans.order_by('-purchase_at').first()
                customer_id = last_plan.asaas_customer_id if last_plan else None

                if not customer_id:
                    customer_id = service.create_customer(user)

                initial_status, _ = Plan_Status.objects.get_or_create(plan_status='Pagamento Pendente')

                is_trial = False
                if plan_type.free_trial_days and plan_type.free_trial_days > 0:
                    is_trial = True

                new_plan = Plan.objects.create(
                    user=user,
                    plan_type=plan_type,
                    status=initial_status,
                    asaas_customer_id=customer_id,
                    preferable_payment_day=preferable_payment_day,
                    is_free_trial=is_trial
                )

                discount = 0.0
                discount_type = 'FIXED'

                if plan_type.discount:
                    if plan_type.discount.fixed_value:
                        discount = float(plan_type.discount.fixed_value)
                        discount_type = 'FIXED_VALUE'
                    elif plan_type.discount.percentage:
                        discount = float(plan_type.discount.percentage)
                        discount_type = 'PERCENTAGE'

                sub_data = service.create_subscription(
                    customer_id=new_plan.asaas_customer_id,
                    plan_type=plan_type,
                    plan=new_plan,
                    discount=discount,
                    discount_type=discount_type,
                )
                
                new_plan.asaas_subscription_id = sub_data.get('id')
                new_plan.payment_link = sub_data.get('paymentLink')
                print(sub_data)
                
                new_plan.save()

                return Response(default_response(
                    success=True,
                    message="Assinatura criada com sucesso.",
                    data={
                        "subscription_id": new_plan.asaas_subscription_id,
                        "payment_link": new_plan.payment_link,
                        "next_due_date": new_plan.next_due_date, # type: ignore
                        "is_trial": new_plan.is_free_trial
                    }
                ), status=201)

        except Exception as e:
            # TODO: Adicionar log de erro real (Sentry/CloudWatch)
            return Response(default_response(
                success=False,
                message="Erro interno ao processar assinatura.",
                data={'error_details': str(e)}
            ), status=500)

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

class PlanItemManagerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a row linking a Enterprise or Sector to the active plan.
        """
        user = request.user
        item_type = request.data.get('type') # 'enterprise' ou 'sector'
        item_id = request.data.get('id')

        try:
            # Do not switch to get_object_or_404. cant select related attributes
            plan = Plan.objects.select_related('plan_type').get(user=user)
        except Plan.DoesNotExist:
            res = Response()
            res.status_code = 404
            res.data = default_response(
                success=False,
                message="Usuário não possui um plano ativo encontrado."
            )
            return res

        if plan.status.plan_status != 'Ativo':
            res = Response()
            res.status_code = 403
            res.data = default_response(
                success=False,
                message="Seu plano não está ativo. Regularize o pagamento."
            )
            return res

        features = plan.plan_type.features or {} # type: ignore
        
        with transaction.atomic():
            if item_type == 'enterprise':
                limit = features.get('enterprises', 0)
                current_usage = plan.items.filter(enterprise__isnull=False).count() # type: ignore
                
                if current_usage >= limit:
                    return Response({
                        'error': 'Limite de empresas atingido. Faça upgrade do plano.',
                        'code': 'LIMIT_REACHED'
                    }, status=400)
                print(item_id)
                target_obj = get_object_or_404(Enterprise, pk=item_id) 

                Plan_Subscription_Item.objects.create(plan=plan, enterprise=target_obj)

            elif item_type == 'sector':
                limit = features.get('sectors', 0)
                current_usage = plan.items.filter(sector__isnull=False).count() # type: ignore
                
                if current_usage >= limit:
                    res = Response()
                    res.status_code = 400
                    res.data = default_response(
                        success=False,
                        message="Limite de setores atingido."
                    )
                    return res
                    
                target_obj = get_object_or_404(Sector, pk=item_id) 
                Plan_Subscription_Item.objects.create(plan=plan, sector=target_obj)

            else:
                res = Response()
                res.status_code = 400
                res.data = default_response(
                    success=False,
                    message="Tipo de recurso inválido."
                )
                return res

        res = Response()
        res.status_code = 201
        res.data = default_response(
            success=True,
            message="Item adicionado ao plano com sucesso."
        )
        return res
    
    def delete(self, request):
        """
        Remove a item from the selected plan.
        """
        user = request.user
        resource_id = request.data.get('id')
        resource_type = request.data.get('type')

        try:
            plan = Plan.objects.get(user=user)
            
            if resource_type == 'enterprise':
                deleted, _ = Plan_Subscription_Item.objects.filter(
                    plan=plan, 
                    enterprise_id=resource_id
                ).delete()
            elif resource_type == 'sector':
                deleted, _ = Plan_Subscription_Item.objects.filter(
                    plan=plan, 
                    sector_id=resource_id
                ).delete()
            else:
                res = Response()
                res.status_code = 400
                res.data = default_response(
                    success=False,
                    message="Tipo inválido."
                )
                return res

            if deleted == 0:
                res = Response()
                res.status_code = 404
                res.data = default_response(
                    success=False,
                    message="Item não encontrado no seu plano."
                )
                return res
            
            res = Response()
            res.status_code = 200
            res.data = default_response(
                success=True,
                message="Item removido do plano."
            )
            return res
        
        except Exception as e:
            res = Response()
            res.status_code = 500
            res.data = default_response(
                success=False,
                message="Erro ao remover item do plano.",
                data={'error': str(e)}
            )
            return res
        
class PlanActiveItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retorna lista de IDs de empresas e setores que estão atualmente no plano.
        """
        try:
            plan = Plan.objects.prefetch_related('items').get(user=request.user)
        except Plan.DoesNotExist:
            res = Response()
            res.status_code = 404
            res.data = default_response(
                success=False,
                message="Usuário não possui um plano ativo encontrado.",
                data={'active_enterprises': [], 'active_sectors': []} # type: ignore
            )
            return res

        active_enterprises = plan.items.filter(enterprise__isnull=False).values_list('enterprise_id', flat=True) # type: ignore
        active_sectors = plan.items.filter(sector__isnull=False).values_list('sector_id', flat=True) # type: ignore

        res = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            data={'active_enterprises': list(active_enterprises), 'active_sectors': list(active_sectors)} # type: ignore
        )
        return res
    