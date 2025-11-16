# apps/core/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from apps.core.utils import default_response
from apps.APIDocumento.models import Document
from apps.APISetor.models import SectorUser
from apps.APIAuditDocument.models import AuditLog
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector
from .utils.feed_formating import format_activity_feed
from .serializers import DashboardDocumentSerializer, ActivityLogSerializer

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
        """ 
        declare request_user int;
        set request_user = 1; 
        
        select * from Enterprise E 
        inner join Sector S on S.enterprise_id = E.enterprise_id
        inner join SectorUser SU on SU.sector_id = S.sector_id
        where 
        E.owner = request_user or
        S.manager = request_user or
        SU.user = request_user

        """

        user_enterprise_links = Enterprise.objects.filter(enterprise_query).distinct()

        review_docs = Document.objects.filter(
            sector__enterprise__in=user_enterprise_links,
            classification__classification_status__status="Revisão necessária" 
        ).order_by('-created_at')
        
        # print('user_enterprise_links', user_enterprise_links)
        # print('review_docs', review_docs)

        # Componente 3: Feed de Atividades nos Documentos (Log Semi-Geral)
        
        enterprise_owners = user_enterprise_links.values_list('owner_id', flat=True)
        print("enterprise_owners", enterprise_owners)
        enterprise_managers = user_enterprise_links.values_list('sectors__manager__user_id', flat=True).exclude(sectors__manager__user_id=None)
        print("enterprise_managers", enterprise_managers)
        enterprise_sectors = user_enterprise_links.values_list('sectors__sector_id').exclude(sectors__sector_id=None).exclude(sectors__is_active=False)
        print("enterprise_sectors", enterprise_sectors)
        enterprise_members = user_enterprise_links.values_list('sectors__sector_links__user', flat=True).exclude(sectors__sector_links__user__user_id=None)
        print("enterprise_members", enterprise_members)

        doc_logs = Document.history.filter( # type: ignore
            sector__in=enterprise_sectors
        ).order_by('-history_date')[:20]
        
        print(doc_logs)

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
        