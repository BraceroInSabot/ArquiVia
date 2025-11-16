from django.urls import path
from .views import OperationalDashboardView

urlpatterns = [
    path("operacional/", OperationalDashboardView.as_view(), name="dashboard-operacional"),
]