import json
from django.http import JsonResponse, QueryDict
from django.views.decorators.csrf import csrf_exempt
from apps.APIPayment.models import Plan, Plan_Status

@csrf_exempt
def asaas_webhook(request):
    """
    Webhook para receber atualizações de pagamento do Asaas.
    Suporta payload application/json e application/x-www-form-urlencoded.
    """
    if request.method != "POST":
        return JsonResponse({}, status=405)

    try:
        # Detecta o tipo de conteúdo e extrai o JSON corretamente
        if request.content_type == 'application/json':
            payload = json.loads(request.body)
        else:
            if not request.POST:
                data_dict = QueryDict(request.body.decode('utf-8'))
                payload_str = data_dict.get('data')
            else:
                payload_str = request.POST.get('data')

            if not payload_str:
                return JsonResponse({'status': 'ignored', 'reason': 'no_data_field'}, status=400)
            
            payload = json.loads(payload_str)

        event = payload.get('event')
        payment = payload.get('payment')

        if not payment:
            return JsonResponse({'status': 'ignored'})

        # TODO: Mover lógica de busca e atualização para um Service
        customer_id = payment.get('customer')
        
        try:
            user_plan = Plan.objects.get(asaas_customer_id=customer_id)
        except Plan.DoesNotExist:
            return JsonResponse({'status': 'customer_not_found'}, status=404)

        if event in ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_CREATED']:
            print(user_plan)
            print(user_plan.status)
            user_plan.status = Plan_Status.objects.get(plan_status_id=1)
            user_plan.save()
            print(user_plan.status)

        elif event == 'PAYMENT_OVERDUE':
            user_plan.status = Plan_Status.objects.get(plan_status_id=3)
            user_plan.save()

        return JsonResponse({'status': 'success'})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        # TODO: Adicionar logger de erro real aqui
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)