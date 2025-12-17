# apps/core/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from apps.core.utils import default_response
from apps.APIDocumento.models import Document
from apps.APISetor.models import SectorUser
from apps.APIAudit.models import AuditLog
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector
from .utils.feed_formating import format_activity_feed
from .serializers import DashboardDocumentSerializer, ActivityLogSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from datetime import datetime, timedelta

from apps.APIDocumento.models import Document
from apps.APISetor.models import Sector
from apps.core.utils import default_response

from .serializers import DashboardDocumentSerializer
from .permissions import IsSectorManagerOrOwner

class OperationalDashboardView(APIView):
    """
    Endpoint centralizado para o Dashboard Operacional.
    Retorna:
    1. Meus últimos documentos criados.
    2. Documentos pendentes de revisão (no meu setor).
    3. Feed de atividades (Log Geral + Documentos).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        request_user = request.user
        
        # Componente 1: Últimos 3 arquivos criados ou editados.
        recent_logs = Document.history.filter( # type:ignore
            Q(history_type='+') | Q(history_type='~'),
            history_user=request_user, 
        ).order_by('-history_date')

        my_docs_ids = []
        seen_ids = set()

        for log in recent_logs:
            if log.document_id not in seen_ids:
                my_docs_ids.append(log.document_id)
                seen_ids.add(log.document_id)
            
            if len(my_docs_ids) == 3:
                break
            
        my_last_docs = Document.objects.filter(pk__in=list(my_docs_ids))
        # print(my_docs_ids)
        
        # Componente 2: Documentos que precisam ser revisados.
        enterprise_query = (
            Q(owner=request_user) |
            Q(sectors__sector_links__user=request_user) |
            Q(sectors__manager=request_user) 
        )

        user_enterprise_links = Enterprise.objects.filter(enterprise_query).distinct()

        user_sector_links = SectorUser.objects.filter(
            (
                Q(user=request_user) | Q(sector__manager=request_user) | Q(sector__enterprise__owner=request_user)
            ),
            sector__enterprise__in=user_enterprise_links,
        )
        
        review_docs = Document.objects.filter(
            sector__in=user_sector_links.values_list('sector', flat=True).distinct(),
            classification__classification_status__status="Revisão necessária" 
        ).order_by('-created_at')

        # Componente 3: Feed de Atividades nos Documentos (Log Semi-Geral)
        
        enterprise_sectors = user_enterprise_links.values_list('sectors__sector_id').exclude(sectors__sector_id=None).exclude(sectors__is_active=False)
                                                               
        doc_logs = Document.history.filter( # type: ignore
            sector__in=enterprise_sectors
        ).order_by('-history_date')[:20]

        activity_feed = format_activity_feed(doc_logs)


        # --- MONTAGEM DA RESPOSTA ---
        data = {
            "my_recent_documents": DashboardDocumentSerializer(my_last_docs, many=True).data,
            "review_pending_documents": DashboardDocumentSerializer(review_docs, many=True).data,
            "activity_feed": ActivityLogSerializer(activity_feed, many=True).data
        }

        return Response(default_response(
            success=True,
            message="Dados do dashboard carregados.",
            data=data # type: ignore
        ))
        

class SectorDashboardView(APIView):
    """
    Endpoint para o Dashboard Gerencial focado em um Setor.
    Calcula KPIs de volume e insights de fluxo de trabalho.
    """
    permission_classes = [IsAuthenticated, IsSectorManagerOrOwner]

    def get(self, request, sector_pk: int):
        
        # --- 1. Validação e Permissão ---
        
        # O 'select_related' aqui é CRUCIAL. 
        # Ele otimiza a checagem de permissão (IsSectorManagerOrOwner)
        # para que ela não faça uma nova query ao checar 'obj.enterprise.owner'.
        try:
            sector = Sector.objects.select_related('enterprise__owner').get(sector_id=sector_pk)
        except Sector.DoesNotExist:
            return Response(default_response(False, "Setor não encontrado."), status=404)

        # Checa se o usuário (request.user) pode ver o objeto (sector)
        self.check_object_permissions(request, sector)

        # --- 2. Query Base ---
        # Filtra todos os documentos que pertencem a este setor
        sector_docs = Document.objects.filter(sector=sector)

        # --- 3. Cálculo dos 5 KPIs (Uma única consulta) ---
        
        kpi_data = sector_docs.aggregate(
            # KPI 1: Total
            total_documentos=Count('document_id'),
            
            # KPI 2: Pendentes (Baseado nos seus modelos)
            pendentes=Count('document_id', filter=Q(
                classification__classification_status__status="Revisão necessária"
            )),
            
            # KPI 3: Concluídos
            concluidos=Count('document_id', filter=Q(
                classification__classification_status__status="Concluído"
            )),
            
            # KPI 4: Arquivados
            arquivados=Count('document_id', filter=Q(
                classification__classification_status__status="Arquivado"
            )),
            
            # KPI 5: Públicos
            publicos=Count('document_id', filter=Q(
                classification__privacity__privacity="Publico"
            ))
        )
        
        # --- 4. Cálculo dos 3 Insights (Queries separadas) ---

        # Insight 1: Gargalo (Documentos pendentes mais antigos)
        oldest_pending_docs = sector_docs.filter(
            classification__classification_status__status="Revisão necessária"
        ).order_by('created_at')[:3] # Ordem ASC (mais antigo primeiro)

        # Insight 2: Risco (Deleções recentes)
        seven_days_ago = datetime.now() - timedelta(days=7)
        deleted_count = Document.history.filter( # type: ignore
            sector=sector,
            history_type='-', # Tipo 'Exclusão'
            history_date__gte=seven_days_ago
        ).count()

        # Insight 3: Carga de Trabalho (Top 5 contribuidores)
        contributors = Document.history.filter( # type: ignore
            sector=sector,
            history_type__in=['+', '~'] # Criações + Edições
        ).values(
            'history_user__name' # Agrupa por nome
        ).annotate(
            activity_count=Count('history_id') # Conta as ações
        ).order_by('-activity_count')[:5]

        
        # --- 5. Montagem da Resposta Final ---
        
        data = {
            "kpis": {
                "total_documentos": kpi_data['total_documentos'],
                "pendentes": kpi_data['pendentes'],
                "concluidos": kpi_data['concluidos'],
                "arquivados": kpi_data['arquivados'],
                "publicos": kpi_data['publicos'],
            },
            "insights": {
                "alerta_exclusoes_7dias": deleted_count,
                "gargalos_pendentes": DashboardDocumentSerializer(oldest_pending_docs, many=True).data,
                "top_colaboradores": list(contributors)
            }
        }
        
        return Response(default_response(
            success=True,
            message=f"Dashboard do setor '{sector.name}' carregado.",
            data=data
        ))