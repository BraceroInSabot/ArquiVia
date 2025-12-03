from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.core.pagination import DocumentPagination
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
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, TrigramSimilarity
from django.db.models import Value, TextField
from django.db.models.functions import Coalesce, Cast, Greatest, Left

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
    Recupera uma lista de todos os documentos visíveis para o usuário.
    Isso inclui:
    1. Documentos da empresa que são PÚBLICOS (de qualquer setor).
    2. Documentos do setor onde o usuário é membro/gerente.
    3. Documentos que o usuário criou.
    4. Todos os documentos se o usuário for o Dono da Empresa.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> HttpResponse:
        request_user = request.user

        enterprise_links = Enterprise.objects.filter(
            Q(owner=request_user) |
            Q(sectors__sector_links__user=request_user) |
            Q(sectors__manager=request_user)
        ).distinct()
        
        queryset = Document.objects.filter(
            sector__enterprise__in=enterprise_links
        )
        
        queryset = queryset.filter(
            Q(classification__privacity__privacity='Público') | 
            Q(creator=request_user) |
            Q(sector__enterprise__owner=request_user) |
            Q(sector__manager=request_user) |
            Q(sector__sector_links__user=request_user)
        ).distinct() 
        
        queryset = queryset.select_related(
            'classification__classification_status', 
            'sector'
        ).order_by('-is_active', '-created_at')

        paginator = DocumentPagination()
        result_page = paginator.paginate_queryset(queryset, request, view=self)
        
        if result_page is not None:
            serializer = DocumentListSerializer(result_page, many=True)
            paginated_data = paginator.get_paginated_response(serializer.data).data
            
            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(
                success=True, 
                message=f"Encontrados {queryset.count()} documentos.", 
                data=paginated_data # type: ignore
            )
            return res
        
        serializer = DocumentListSerializer(queryset, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True, 
            message=f"Encontrados {queryset.count()} documentos.", 
            data=serializer.data
        )
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
    
    def patch(self, request, pk: int):
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
        
        attached_files = queryset.attached_files.filter(detached_at__isnull=True) # type: ignore
        
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

        if privacity_id == '1': # Privado
            queryset = queryset.filter(
                Q(classification__privacity=privacity_id) &
                (
                    Q(sector__enterprise__owner=request_user) |
                    Q(sector__manager=request_user) |
                    Q(sector__sector_links__user=request_user)
                )
            )
        elif privacity_id == '2': # Público
            queryset = queryset.filter(classification__privacity=privacity_id)
        else:
            pass

        if reviewer_name:
            queryset = queryset.filter(classification__reviewer__name__icontains=reviewer_name)

        if categories_list:
            queryset = queryset.filter(categories__category__in=categories_list)

        if querySearch:
            safe_content = Left(
                Cast(Coalesce('content', Value('{}')), TextField()), # type: ignore
                999_999 # 1MB é 1048576, usamos 1M para ter margem
            )
            
            vector = (
                SearchVector('title', weight='B', config='portuguese') + 
                SearchVector('search_content', weight='A', config='portuguese')
            )
            
            search_query = SearchQuery(querySearch, config='portuguese')
            
            queryset = queryset.annotate(
                rank=SearchRank(
                    vector, 
                    search_query,
                ),
                sim_title=TrigramSimilarity('title', querySearch),
                
                sim_content=TrigramSimilarity('search_content', querySearch),
            ).annotate(
                similarity=Greatest('sim_title', 'sim_content')
            ).filter(
                Q(rank__gte=0.5) | Q(similarity__gt=0.3)
            ).order_by('-similarity','-rank')
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
        
        paginator = DocumentPagination()
        result_page = paginator.paginate_queryset(queryset, request, view=self)
        
        if result_page is not None:
            serializer = self.serializer_class(result_page, many=True)
            paginated_data = paginator.get_paginated_response(serializer.data).data
            
            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(
                success=True, 
                message=f"Encontrados {queryset.count()} documentos.", 
                data=paginated_data # type: ignore
            )
            return res
        
        serializer = self.serializer_class(queryset, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message=f"Encontrados {queryset.count()} documentos relevantes.",
            data=serializer.data
        )
        return res
    