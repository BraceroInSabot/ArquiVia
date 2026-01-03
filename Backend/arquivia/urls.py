"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

VERSAO = "v2"

urlpatterns = [
    # path("admin/", admin.site.urls),
    path(f"api/{VERSAO}/usuario/", include("apps.APIUser.urls")),
    path(f"api/{VERSAO}/empresa/", include("apps.APIEmpresa.urls")),
    path(f"api/{VERSAO}/setor/", include("apps.APISetor.urls")),
    path(f"api/{VERSAO}/documento/", include("apps.APIDocumento.urls")),
    path(f"api/{VERSAO}/documento-auditoria/", include("apps.APIAudit.urls")),
    path(f"api/{VERSAO}/painel/", include("apps.APIDashboard.urls")),
    path(f"api/{VERSAO}/pagamento/", include("apps.APIPayment.urls")),
]
