from django.urls import path
from apps.APIPayment.utils.webhook import asaas_webhook
from .views import (
    CreateCheckoutView, 
    DebugCreatePlanView, 
    PlanDashboardView,
    PlansRetrievalView,
    PlanItemManagerView,
    PlanActiveItemsView
)


urlpatterns = [
    path('criar-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
    path('webhook/', asaas_webhook, name='asaas-webhook'),
    path('dev/criar-plano/<int:plan_type_id>/', DebugCreatePlanView.as_view(), name='debug-create-plan'),
    path('dashboard/', PlanDashboardView.as_view(), name='plan-dashboard'),
    path('planos-disponiveis/', PlansRetrievalView.as_view(), name='plans-retrieval'),
    path('alterar-plano/', PlanItemManagerView.as_view(), name='plan-management'),
    path('planos-ativos/', PlanActiveItemsView.as_view(), name='plan-active-items')
]
