from django.urls import path
from .views import CreateCheckoutView, DebugCreatePlanView
from apps.APIPayment.utils.webhook import asaas_webhook
from django.conf import settings

urlpatterns = [
    path('criar-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
    path('webhook/', asaas_webhook, name='asaas-webhook'),
    path('dev/criar-plano/<int:plan_type_id>/', DebugCreatePlanView.as_view(), name='debug-create-plan'),
]
