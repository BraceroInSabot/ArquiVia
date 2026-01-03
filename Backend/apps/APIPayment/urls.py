from django.urls import path
from .views import CreateCheckoutView
from apps.APIPayment.utils.webhook import asaas_webhook

urlpatterns = [
    path('criar-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
    path('webhook/', asaas_webhook, name='asaas-webhook'),
]
