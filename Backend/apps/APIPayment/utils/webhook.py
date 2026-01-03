# apps/financas/webhooks.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.APIPayment.models import Plan, Plan_Status

@csrf_exempt
def asaas_webhook(request):
    if request.method != "POST":
        return JsonResponse({}, status=405)
    print(json.loads(request.body))
    try:
        event_data = json.loads(request.body)
        event = event_data.get('event')
        payment = event_data.get('payment')
        
        # Loga tudo em dev para entender o fluxo
        print(f"WEBHOOK RECEBIDO: {event}")

        if not payment:
            return JsonResponse({'status': 'ignored'})

        # Busca a user_plan pelo Customer ID (é mais seguro que subscription id as vezes)
        customer_id = payment.get('customer')
        
        try:
            user_plan = Plan.objects.get(asaas_customer_id=customer_id)
        except Plan.DoesNotExist:
            return JsonResponse({'status': 'customer_not_found'}, status=404)

        # Lógica de Atualização de Status
        if event == 'PAYMENT_CONFIRMED' or event == 'PAYMENT_RECEIVED':
            user_plan.status = Plan_Status.objects.get(plan_status='ACTIVE')
            # Atualiza a data de vencimento se vier no payload
            # user_plan.next_due_date = ... 
            user_plan.save()
            print(f"Plan de {user_plan.user} ATIVADA!")

        elif event == 'PAYMENT_OVERDUE':
            user_plan.status = Plan_Status.objects.get(plan_status='OVERDUE')
            user_plan.save()
            # TODO: Bloquear acesso do usuário aqui ou disparar e-mail

    except Exception as e:
        print(f"Erro webhook: {e}")
        return JsonResponse({'status': 'error'}, status=500)

    return JsonResponse({'status': 'success'})