from django.urls import path
from .views import OperationalDashboardView, SectorDashboardView

urlpatterns = [
    path("operacional/", OperationalDashboardView.as_view(), name="dashboard-operacional"),
    path("gerencial/<int:sector_pk>/", SectorDashboardView.as_view(), name="dashboard-gerencial-setor"),
]