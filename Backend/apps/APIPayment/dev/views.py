# views.py
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from apps.APIPayment.models import Plan, Plan_Type
from rest_framework.permissions import IsAuthenticated
from apps.core.utils import default_response
from django.shortcuts import get_object_or_404

class DebugCreatePlanView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, plan_type_id):
        """
        View de desenvolvimento para simular a aquisição de um plano para o usuário logado.
        """
        user = request.user
        plan_type = get_object_or_404(Plan_Type, pk=plan_type_id)

        if Plan.objects.filter(user=user).exists():
            res = Response()
            res.status_code = 400
            res.data = default_response(
                success=False, 
                message="Usuário já possui um plano!", 
                data={'plan_id': user.plan.pk}
                )
            return res

        try:
            with transaction.atomic():
                new_plan = Plan.create_plan_for_user(user)
                new_plan.create_subscription(plan_type)

            res = Response()
            res.status_code = 201
            res.data = default_response(
                success=True,
                message="Plan criada com sucesso",
                data= {
                    'plan_id': new_plan.pk,
                    'status': str(new_plan.status),
                    'user': user.email
                }
            )
            return res

        except Exception as e:
            res = Response()
            res.status_code = 500
            res.data = default_response(
                success=False,
                message="Erro ao criar o plano.",
                data={'error': str(e)}
            )
            return res