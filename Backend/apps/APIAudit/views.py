
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.APIDocumento.models import Attached_Files_Document, Document
from rest_framework.permissions import IsAuthenticated
from apps.core.utils import default_response
from apps.APIDocumento.permissions import IsLinkedToDocument
from .serializers import DocumentHistorySerializer
from apps.APIDocumento.serializers import DocumentDetailSerializer


class DocumentHistoryListView(APIView):
    """
    GET /api/documento/<pk>/historico/
    Lista todas as alterações feitas no documento.
    """
    permission_classes = [IsAuthenticated, IsLinkedToDocument]

    def get(self, request, pk: int):
        doc_queryset = Document.objects.select_related('sector__enterprise__owner', 'sector__manager')
        document = get_object_or_404(doc_queryset, pk=pk)
        
        self.check_object_permissions(request, document)

        history_queryset = document.history.all().order_by('-history_date') # type: ignore

        serializer = DocumentHistorySerializer(history_queryset, many=True)

        return Response(default_response(
            success=True,
            message=f"Histórico recuperado. Total de versões: {history_queryset.count()}",
            data=serializer.data
        ))


class DocumentRevertView(APIView):
    """
    POST /api/documento/<pk>/reverter/<history_id>/
    Reverte o documento para o estado de uma versão específica.
    """
    permission_classes = [IsAuthenticated, IsLinkedToDocument]

    def post(self, request, pk: int, history_id: int):
        doc_queryset = Document.objects.select_related('sector__enterprise__owner', 'sector__manager')
        document = get_object_or_404(doc_queryset, pk=pk)
        
        self.check_object_permissions(request, document)

        try:
            target_version = document.history.get(history_id=history_id) # type: ignore
        except document.history.model.DoesNotExist: # type: ignore
            return Response(default_response(
                success=False,
                message="Versão de histórico não encontrada.",
                data=None # type: ignore
            ), status=404)

        restored_doc = target_version.instance
        
        restored_doc.pk = document.pk 
        
        restored_doc.save()

        response_serializer = DocumentDetailSerializer(restored_doc)

        return Response(default_response(
            success=True,
            message=f"Documento revertido com sucesso para a versão de {target_version.history_date}.",
            data=response_serializer.data
        ))