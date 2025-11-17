from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Attached_Files_Document, Document
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    AttachFileSerializer, 
    DocumentCreateSerializer, 
    DocumentDetailSerializer, 
    DocumentListSerializer, 
    DocumentUpdateSerializer,
)
from rest_framework.parsers import JSONParser
from apps.APIDocumento.permissions import CanAttachDocument, CanDELETEDocument, IsLinkedToDocument, CanActivateOrDeactivateDocument
from apps.core.utils import default_response
from django.http import HttpResponse
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

User = get_user_model()

class CreateDocumentView(APIView):
    """
    Cria um novo documento.
    A permissão de acesso é tratada pelo serializer (validate_sector).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser] 
    
    def post(self, request) -> HttpResponse:
    
        serializer = DocumentCreateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        serializer.is_valid(raise_exception=True)
        
        documento = serializer.save()
        
        res: HttpResponse = Response()
        res.status_code = 201
        res.data = default_response(success=True, message="Documento criado com sucesso!", data={"document_id": documento.pk}) # type: ignore
        return res
    
class ListDocumentsView(APIView):
    """
    Recupera uma lista de todos os documentos aos quais o usuário está vinculado.
    Exclui o campo 'content' para uma resposta leve e otimizada.
    
    Um usuário está vinculado se for:
    1. O criador do documento.
    2. O dono da empresa do setor do documento.
    3. O gerente do setor do documento.
    4. Um membro (via SectorUser) do setor do documento.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> HttpResponse:
        """
        Manipula a requisição GET para listar os documentos vinculados.

        Args:
            request (Request): O objeto da requisição do usuário.

        Returns:
            HttpResponse: Uma resposta contendo a lista de metadados dos documentos.
        """
        request_user = request.user

        query = (
            Q(creator=request_user) |
            Q(sector__enterprise__owner=request_user) |
            Q(sector__manager=request_user) |
            Q(sector__sector_links__user=request_user)
        )

        documents_queryset = Document.objects.filter(query).select_related('creator').distinct()

        serializer = DocumentListSerializer(documents_queryset, many=True)
        
        if not serializer.data:
            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(success=True, message="Nenhum documento encontrado.", data=[])
            return res
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Lista de documentos recuperada com sucesso.", data=serializer.data)
        return res
    
class RetrieveDocumentView(APIView):
    """
    Recupera os detalhes de um único documento.
    O ID do documento deve ser passado na URL.
    A permissão é verificada pela classe IsLinkedToDocument.
    """
    permission_classes = [IsAuthenticated, IsLinkedToDocument]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Handles the GET request to retrieve a specific document by its PK.

        Args:
            request (Request): The user request object.
            pk (int): The primary key of the document, from the URL.

        Returns:
            HttpResponse: A response containing the document details or an error.
        """
        queryset = Document.objects.select_related(
            'sector', 
            'sector__manager',
            'sector__enterprise__owner',
            'classification',
            'classification__classification_status',
            'classification__privacity',
            'classification__reviewer'
        ).prefetch_related(
            'categories'
        )
        document = get_object_or_404(queryset, pk=pk)
        
        self.check_object_permissions(request, document)

        serializer = DocumentDetailSerializer(document)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res
    
class UpdateDocumentView(APIView):
    """
    Atualiza parcialmente um documento (título ou conteúdo).
    O ID do documento deve ser passado na URL.
    A permissão é verificada pela classe IsLinkedToDocument.
    """
    permission_classes = [IsAuthenticated, IsLinkedToDocument]

    def patch(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição PATCH para atualizar parcialmente um documento.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária do documento, vinda da URL.

        Returns:
            HttpResponse: Uma resposta contendo o documento atualizado ou um erro.
        """
        queryset = Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        ).prefetch_related('sector__sector_links__user')
        document = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, document)

        serializer = DocumentUpdateSerializer(
            instance=document, 
            data=request.data, 
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        updated_document = serializer.save()

        response_serializer = DocumentDetailSerializer(updated_document)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Documento atualizado com sucesso!", data=response_serializer.data)
        return res
    
class ActivateOrDeactivateDocumentView(APIView):
    permission_classes = [IsAuthenticated, CanActivateOrDeactivateDocument]
    
    def put(self, request, pk: int):
        document = get_object_or_404(Document, pk=pk)
        
        self.check_object_permissions(request, document)
        
        document.is_active = not document.is_active
        document.save()
        
        ret = Response()
        ret.status_code = 200
        ret.data =  default_response(success=True, message=f"Documento {"desativado" if document.is_active else "restaurado"} com sucesso.")
        return ret
    
class DeleteDocumentView(APIView):
    permission_classes = [IsAuthenticated, CanDELETEDocument]
    
    def delete(self, request, pk: int):

        document = get_object_or_404(Document, pk=pk)
        
        self.check_object_permissions(request, document)
        
        document.delete()
        
        ret = Response()
        ret.status_code = 200
        ret.data = default_response(success=True, message="Documento excluído com sucesso.")
        return ret
    
# Attaching Files

class AttachFileToDocumentView(APIView):
    """
    View para anexar (upload) um arquivo a um Documento existente.
    
    URL esperada: /api/documento/<int:doc_pk>/anexar-arquivo/
    Método: POST
    Body (form-data):
        - title: string
        - file: arquivo binário
    """
    permission_classes = [IsAuthenticated, CanAttachDocument]
    
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk: int) -> HttpResponse:
        """
        Recebe o arquivo e o vincula ao documento informado na URL.
        """
        queryset = Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        )
        document = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, document)

        serializer = AttachFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.save(document_id=document)

        res: HttpResponse = Response()
        res.status_code = 201
        res.data = default_response(
            success=True,
            message="Arquivo anexado com sucesso.",
            data=serializer.data
        )
        return res
    
class DetachFileToDocumentView(APIView):
    permission_classes = [IsAuthenticated, CanAttachDocument]
    
    def patch(self, request, pk: int):
        """
        Remove o vinculo do arquivo feito o upload com o documento.
        """
        queryset = get_object_or_404(Attached_Files_Document, pk=pk)
        document_attached = queryset.document_id
        
        self.check_object_permissions(request, document_attached)
        
        queryset.detached_at = timezone.now()
        
        queryset.save()
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Arquivo removido com sucesso.")
        return res
    
class ListAttachedFilesToDocumentView(APIView):
    permission_classes = [IsAuthenticated, CanAttachDocument]
    
    def get(self, request, pk: int):
        """
        Realiza a consulta de todos os arquivos anexados ao documento.
        """
        queryset = get_object_or_404(Document, pk=pk)
        
        self.check_object_permissions(request, queryset)
        
        attached_files = queryset.attached_files.filter(detached_at__isnull=True)
        
        serializer = AttachFileSerializer(attached_files, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Arquivos recuperados com sucesso.", data=serializer.data)
        return res
    
class DocumentSearchView(APIView):
    """
    Endpoint unificado de Busca e Filtro de Documentos.
    Combina IR (q=) com filtros estruturados (status_id=, etc.).
    """
    permission_classes = [IsAuthenticated]

    serializer_class = DocumentListSerializer 

    def get(self, request):
        request_user = request.user
        
        querySearch = request.query_params.get('q', None)
        status_id = request.query_params.get('status_id', None)
        privacity_id = request.query_params.get('privacity_id', None)
        reviewer_name = request.query_params.get('reviewer_name', None)
        
        is_reviewed_param = request.query_params.get('is_reviewed', None)
        is_reviewed = None
        if is_reviewed_param == 'true':
            is_reviewed = True
        elif is_reviewed_param == 'false':
            is_reviewed = False

        categories_list = request.query_params.get('categories')
        if categories_list is not None:
            categories_list = categories_list.split(';')
            categories_list = [category.strip() for category in categories_list]



        enterprise_links = Enterprise.objects.filter(
            Q(owner=request_user) |
            Q(sectors__sector_links__user=request_user) |
            Q(sectors__manager=request_user)
        ).distinct()
        
        queryset = Document.objects.filter(
            sector__enterprise__in=enterprise_links
        )
        
        if is_reviewed is not None:
            queryset = queryset.filter(classification__is_reviewed=is_reviewed)
        
        if status_id:
            queryset = queryset.filter(classification__classification_status=status_id)
        
        if privacity_id:
            queryset = queryset.filter(classification__privacity=privacity_id)
            
        if reviewer_name:
            queryset = queryset.filter(classification__reviewer__name__icontains=reviewer_name)

        if categories_list:
            queryset = queryset.filter(categories__category__in=categories_list)
            print(queryset.query, categories_list)

        
        if querySearch:
            vector = (
                SearchVector('title', weight='A', config='portuguese') + 
                SearchVector('content', weight='B', config='portuguese')
            )
            search_query = SearchQuery(querySearch, config='portuguese')
            
            queryset = queryset.annotate(
                rank=SearchRank(vector, search_query)
            ).filter(
                rank__gte=0.1
            ).order_by('-rank')
        else:
            queryset = queryset.order_by('-created_at')

        queryset = queryset.distinct().select_related(
            'sector', 
            'classification__classification_status', 
            'classification__privacity',
            'classification__reviewer',
            'creator'
        ).prefetch_related(
            'categories'
        )
        
        serializer = self.serializer_class(queryset, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message=f"Encontrados {queryset.count()} documentos relevantes.",
            data=serializer.data
        )
        return res
    