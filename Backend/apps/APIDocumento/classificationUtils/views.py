from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from apps.APIDocumento.permissions import IsLinkedToDocument
from apps.core.utils import default_response
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Document
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from .serializers import RetrieveClassificationSerializer, UpdateClassificationSerializer

User = get_user_model()

class RetrieveClassificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição GET para recuperar a classificação
        de um documento específico pelo PK do Documento.

        Args:
            request (Request): O objeto da requisição.
            pk (int): A chave primária (ID) do DOCUMENTO.

        Returns:
            HttpResponse: A resposta com os dados da classificação.
        """
        document = get_object_or_404(Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        ), pk=pk)
        
        classification = get_object_or_404(Classification.objects.select_related(
            'classification_status',
            'reviewer',
            'privacity'
        ), document=document)
        
        serializer = RetrieveClassificationSerializer(classification)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res

class UpdateClassificationView(APIView):
    permission_classes = [IsAuthenticated, IsLinkedToDocument]

    def patch(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição PATCH para atualizar a classificação.

        Args:
            request (Request): O objeto da requisição.
            pk (int): A chave primária do DOCUMENTO!!

        Returns:
            HttpResponse: A resposta com os dados da classificação atualizada.
        """
        queryset = Document.objects.select_related(
            'sector__enterprise__owner', 
            'sector__manager'
        )
        document = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, document)
        
        try:
            classification_to_update = document.classification
        except Classification.DoesNotExist:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Classificação não encontrada para este documento.")
            return res
        
        serializer = UpdateClassificationSerializer(
            instance=classification_to_update, 
            data=request.data, 
            partial=True
        )
        
        serializer.is_valid(raise_exception=True)
        
        classification_updated = serializer.save()
        
        serializer = RetrieveClassificationSerializer(classification_updated)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res
    