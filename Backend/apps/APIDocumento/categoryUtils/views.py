from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from apps.APIDocumento.categoryUtils.permissions import CanListCategory, IsCategoryADM, IsCategoryEditor, IsCategoryVisible, IsDocumentEditor
from apps.APIDocumento.permissions import IsLinkedToDocument
from apps.core.utils import default_response
from apps.APIDocumento.categoryUtils.serializers import CategoryDetailSerializer, CategoryListSerializer, CreateCategorySerializer, DeleteCategorySerializer, DocumentAddCategoriesSerializer, ListCategoriesByDocumentId, UpdateCategorySerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Document, Category
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from django.db.models import Q

User = get_user_model()

class CreateCategoryView(APIView):
    permission_classes = [IsAuthenticated, IsCategoryADM]

    def post(self, request, pk: int):
        """
        Cria uma categoria para o Setor (pk)

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta contendo os detalhes da categoria.
        """
        sector_query = get_object_or_404(Sector, pk=pk)
        
        self.check_object_permissions(request, sector_query)
        
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
    permission_classes = [IsAuthenticated, CanListCategory]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição GET para listar as categorias filtradas.

        Args:
            pk (int): A chave primária da Categoria, vinda da URL.
            request (Request): O objeto da requisição do usuário.

        Returns:
            HttpResponse: Uma resposta contendo a lista de categorias.
        """
        request_user = request.user
        
        sector_query = get_object_or_404(Sector, pk=pk)
        
        category_query = Q(category_sector=sector_query) 

        self.check_object_permissions(request, sector_query)

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
    permission_classes = [IsAuthenticated, IsCategoryADM]
    
    def patch(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição PATCH para atualizar parcialmente uma categoria.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta contendo os dados atualizados da categoria.
        """
        sector_id = request.data.get('sector_id')
        
        sector_query = get_object_or_404(Sector, pk=sector_id)
        
        self.check_object_permissions(request, sector_query)

        queryset = Category.objects.select_related(
            'category_enterprise__owner',
            'category_sector__manager'
        )
        category = get_object_or_404(queryset, pk=pk)
        
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
    permission_classes = [IsAuthenticated, IsCategoryADM]

    def delete(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição DELETE para excluir uma categoria.

        Args:
            request (Request): O objeto da requisição do usuário.
            pk (int): A chave primária da Categoria, vinda da URL.

        Returns:
            HttpResponse: Uma resposta (200) indicando sucesso na exclusão.
        """
        sector_id = request.data.get('sector_id')
        
        sector_query = get_object_or_404(Sector, pk=sector_id)

        self.check_object_permissions(request, sector_query)

        category = get_object_or_404(Category, pk=pk)

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
        
        try: 
            document.categories.clear() # Remove all existing categories

            if categories_to_add:
                document.categories.add(*categories_to_add)
                message = "Categorias vinculadas com sucesso."
            else:
                message = "Nenhuma categoria nova para adicionar."
        except Exception as e:
            message = f"Erro ao vincular categorias: {str(e)}"

        
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
    
class ListCategoriesByDocumentView(APIView):
    permission_classes = [IsAuthenticated, IsDocumentEditor]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Retorna as categorias vinculadas ao documento.
        
        Args:
            pk (int): Indice do Documento.
        
        Returns:
            HttpResponse: Lista de categorias.
        """
        document_query = Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        )
        document = get_object_or_404(document_query, pk=pk)

        self.check_object_permissions(request, document)

        is_owner = document.sector.enterprise.owner == request.user # type: ignore
        is_manager = document.sector.manager == request.user # type: ignore
        is_sector_admin = SectorUser.objects.filter(user=request.user, sector=document.sector, is_adm=True).exists() # type: ignore

        if is_owner or is_manager or is_sector_admin:
            categories = document.categories.all()
        else:
            categories = document.categories.filter(
                Q(is_public=True) |
                Q(category_sector=document.sector) # type: ignore
            ).distinct()
        
        serializer = ListCategoriesByDocumentId(categories, many=True)
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res
    
class ListAvailableCategoriesByDocumentIdView(APIView):
    """
    Lista as categorias disponíveis para serem vinculadas a um
    documento específico.
    
    - O ID do Documento é passado na URL (pk).
    - Opcionalmente filtra por um termo de busca (?search=...).
    - Exclui categorias que já estão vinculadas ao documento.
    """
    permission_classes = [IsAuthenticated, IsDocumentEditor]

    def get(self, request, pk: int) -> HttpResponse:
        """
        Manipula a requisição GET.
        
        Args:
            request (Request): A requisição.
            pk (int): A chave primária do Documento (vinda da URL).

        Returns:
            HttpResponse: A lista de categorias disponíveis.
        """
        doc_queryset = Document.objects.select_related(
            'sector__enterprise__owner',
            'sector__manager'
        ).prefetch_related(
            'categories' 
        )
        
        document = get_object_or_404(doc_queryset, pk=pk)
        
        self.check_object_permissions(request, document)

        search_term = request.query_params.get('search', None)
        
        doc_enterprise = document.sector.enterprise # type: ignore

        available_categories = Category.objects.filter(
            category_enterprise=doc_enterprise
        )

        if search_term:
            available_categories = available_categories.filter(
                Q(category__icontains=search_term) |
                Q(description__icontains=search_term)
            )

        linked_category_ids = [cat.pk for cat in document.categories.all()]
        
        if linked_category_ids:
            available_categories = available_categories.exclude(
                pk__in=linked_category_ids
            )
            
        final_queryset = available_categories.order_by('category')[:20] 

        response_serializer = CategoryDetailSerializer(final_queryset, many=True)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message="Categorias disponíveis encontradas.",
            data=response_serializer.data
        )
        return res
    
class ListAllDisponibleCategoriesView(APIView):
    """
    Lista todas as categorias visíveis para o usuário logado.
    
    Isso inclui todas as categorias das empresas às quais
    o usuário pertence (como Dono, Gerente ou Membro).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CategoryListSerializer

    def get(self, request):
        request_user = request.user

        user_enterprise_links = Enterprise.objects.filter(
            Q(owner=request_user) |
            Q(sectors__sector_links__user=request_user) |
            Q(sectors__manager=request_user)
        ).distinct()


        queryset = Category.objects.filter(
            category_enterprise__in=user_enterprise_links
        )
        
        final_queryset = queryset.select_related(
            'category_enterprise',
            'category_sector'
        ).order_by('category')
        
        serializer = self.serializer_class(final_queryset, many=True)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message=f"Encontradas {final_queryset.count()} categorias.",
            data=serializer.data
        )
        return res