from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Attached_Files_Document, Document
from rest_framework.permissions import IsAuthenticated
from .serializers import AttachFileSerializer, DocumentCreateSerializer, DocumentDetailSerializer, DocumentListSerializer, DocumentUpdateSerializer
from rest_framework.parsers import JSONParser
from apps.APIDocumento.permissions import CanAttachDocument, IsLinkedToDocument
from apps.core.utils import default_response
from django.http import HttpResponse
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser

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
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        document_id = request.data.get('document_id', '')
        
        if type(document_id) != int:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "ID inválido."
                }
            }
            return ret

        try:
            document = Document.objects.get(doc_id=document_id)
        except Document.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Documento não encontrado."
                }
            }
            return ret
        
        try:
            if not (SectorUser.objects.filter(user=request.user, sector=document.sector).exists() 
                or 
                Sector.objects.filter(manager=request.user, sector_id=document.sector.sector_id).exists()):
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para completar essa ação."
                    }
                }
                return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Erro ao verificar permissão do usuário: {str(e)}"
                }
            }
            return ret
        
        document.is_eliminate = not document.is_eliminate
        document.save()
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Documento eliminado com sucesso."
            }
        }
        return ret
    
class DeleteDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        document_id = request.data.get('document_id', '')
        
        if type(document_id) != int:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "ID inválido."
                }
            }
            return ret

        try:
            document = Document.objects.get(doc_id=document_id)
        except Document.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Documento não encontrado."
                }
            }
            return ret
        
        try:
            if not (SectorUser.objects.filter(user=request.user, sector=document.sector).exists() 
                or 
                Sector.objects.filter(manager=request.user, sector_id=document.sector.sector_id).exists()):
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para completar essa ação."
                    }
                }
                return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Erro ao verificar permissão do usuário: {str(e)}"
                }
            }
            return ret
        
        document.delete()
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Documento deletado com sucesso."
            }
        }
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
    
    