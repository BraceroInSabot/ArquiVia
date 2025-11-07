from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from apps.APIDocumento.categoryUtils.permissions import IsCategoryEditor, IsCategoryVisible, IsDocumentEditor
from apps.APIDocumento.permissions import IsLinkedToDocument
from apps.core.utils import default_response
from apps.APIDocumento.categoryUtils.serializers import CategoryDetailSerializer, CategoryListSerializer, CreateCategorySerializer, DeleteCategorySerializer, DocumentAddCategoriesSerializer, UpdateCategorySerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Document, Category
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.db.models import Q

User = get_user_model()

class CreateCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        serializer = CreateCategorySerializer(
            data=request.data, 
            context={'request': request}
        )
        
        serializer.is_valid(raise_exception=True)
        
        category_created = serializer.save()
        
        ret = Response()
        ret.status_code = 201
        ret.data = default_response(success=True, message="Categoria criada com sucesso!", data={"category_id": category_created.category_id}) # type: ignore
        return ret

class RetrieveCategoryView(APIView):
    """
    Recupera os detalhes de uma única Categoria, identificada pelo 'pk' na URL.
    
    A permissão é verificada pela classe IsCategoryVisible:
    - Garante que o usuário esteja autenticado.
    - Garante que a categoria seja pública ou que o usuário pertença à empresa.
    """
    permission_classes = [IsAuthenticated, IsCategoryVisible]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição GET para recuperar uma categoria específica.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta contendo os detalhes da categoria.
        """
        queryset = Category.objects.select_related(
            'category_enterprise__owner', 
            'category_sector'
        )
        category = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, category)

        serializer = CategoryDetailSerializer(category)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res

class ListCategoryView(APIView):
    """
    Recupera uma lista de todas as Categorias visíveis para o usuário.

    Um usuário pode ver uma Categoria se:
    1. A Categoria for pública (is_public=True).
    2. A Categoria pertencer a uma Empresa à qual o usuário está vinculado
       (seja como dono, gerente de setor ou membro de setor).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> HttpResponse:
        """
        Manipula a requisição GET para listar as categorias filtradas.

        Args:
            request (Request): O objeto da requisição do usuário.

        Returns:
            HttpResponse: Uma resposta contendo a lista de categorias.
        """
        request_user = request.user

        linked_enterprise_ids = Enterprise.objects.filter(
            Q(owner=request_user) |
            Q(sectors__manager=request_user) |
            Q(sectors__sector_links__user=request_user)
        ).values_list('pk', flat=True).distinct()

        category_query = (
            Q(is_public=True) |
            Q(category_enterprise__pk__in=linked_enterprise_ids)
        )

        categories_queryset = Category.objects.filter(category_query).select_related(
            'category_enterprise', 
            'category_sector'
        ).distinct()

        serializer = CategoryListSerializer(categories_queryset, many=True)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Lista de categorias recuperada com sucesso.", data=serializer.data)
        return res

class UpdateCategoryView(APIView):
    """
    Atualiza parcialmente uma Categoria (nome, descrição, setor, etc.).
    O ID da Categoria deve ser passado na URL.
    A permissão é verificada pela classe IsCategoryEditor.
    """
    permission_classes = [IsAuthenticated, IsCategoryEditor]
    
    def patch(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição PATCH para atualizar parcialmente uma categoria.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta contendo os dados atualizados da categoria.
        """
        queryset = Category.objects.select_related(
            'category_enterprise__owner',
            'category_sector__manager'
        )
        category = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, category)
        
        update_serializer = UpdateCategorySerializer(
            instance=category,
            data=request.data,
            partial=True
        )

        update_serializer.is_valid(raise_exception=True)

        updated_category = update_serializer.save()
        
        response_serializer = CategoryDetailSerializer(updated_category)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Categoria atualizada com sucesso!", data=response_serializer.data)
        return res
    
class DeleteCategoryView(APIView):
    """
    Exclui uma Categoria.
    O ID da Categoria deve ser passado na URL.
    A permissão é verificada pela classe IsCategoryEditor.
    A exclusão é barrada se a categoria estiver em uso.
    """
    permission_classes = [IsAuthenticated, IsCategoryEditor]

    def delete(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição DELETE para excluir uma categoria.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta (200) indicando sucesso na exclusão.
        """
        queryset = Category.objects.select_related(
            'category_enterprise__owner',
            'category_sector__manager'
        )
        category = get_object_or_404(queryset, pk=pk)

        self.check_object_permissions(request, category)

        delete_serializer = DeleteCategorySerializer(
            instance=category,
            data={} 
        )
        
        delete_serializer.is_valid(raise_exception=True)

        category.delete()

        res: HttpResponse = Response()
        res.status_code = 200 
        res.data = default_response(
            success=True, 
            message="Categoria excluída com sucesso.",
        )
        return res
    
class LinkCategoriesToDocumentView(APIView):
    """
    View de Ação para VINCULAR (add) uma ou mais Categorias a um Documento.
    
    O ID do Documento é passado na URL (doc_pk).
    O payload contém 'categories_id' (lista).
    A permissão é checada contra o Documento (IsDocumentEditor).
    """
    permission_classes = [IsAuthenticated, IsDocumentEditor]

    serializer_class = DocumentAddCategoriesSerializer

    def post(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição POST para adicionar categorias.
        
        Args:
            request (Request): Contém o payload {categories_id[]}.
            pk (int): A chave primária do Documento, vinda da URL.

        Returns:
            HttpResponse: O status da operação e a lista atualizada
                          de categorias do documento.
        """
        queryset = Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        )
        document = get_object_or_404(queryset, pk=pk)
        
        self.check_object_permissions(request, document)

        serializer_context = {'document': document}
        serializer = self.serializer_class(
            data=request.data,
            context=serializer_context
        )
        serializer.is_valid(raise_exception=True)
        
        categories_to_add = serializer.validated_data['categories'] # type: ignore
        
        if categories_to_add:
            document.categories.add(*categories_to_add)
            message = "Categorias vinculadas com sucesso."
        else:
            message = "Nenhuma categoria nova para adicionar."
        
        all_doc_categories = document.categories.all()
        response_serializer = CategoryDetailSerializer(all_doc_categories, many=True)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True, 
            message=message,
            data=response_serializer.data
        )
        return res