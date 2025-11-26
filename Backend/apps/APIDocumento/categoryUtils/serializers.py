from rest_framework.serializers import ModelSerializer
from apps.APIDocumento.models import Category, Document
from apps.APISetor.models import Sector, SectorUser
from apps.APIEmpresa.models import Enterprise
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SectorSerializer(ModelSerializer):
    
    class Meta:
        model = Sector
        fields = ['sector_id', 'name']


class CreateCategorySerializer(ModelSerializer):
    category_sector = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(), 
        required=True, 
        allow_null=False
    )
    category_enterprise = serializers.PrimaryKeyRelatedField(
        queryset=Enterprise.objects.all(),
        required=False, 
        allow_null=True
    )
    category = serializers.CharField(
        max_length=100, 
        min_length=3, 
        required=True
    )
    description = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        allow_null=True
    )
    is_public = serializers.BooleanField(
        required=False,
        default=False
    )
    
    
    def validate_category_sector(self, category_sector):
        """
        Método de validação customizado para o campo 'sector'.
        Verifica se o usuário tem permissão para criar uma categoria neste setor.
        
        Args:
            sector (Sector): Setor encaminhado pelo usuário.
            
        Returns:
            Sector: Setor válido.
            
        Raises:
            serializers.ValidationError: Se o usuário não tiver permissão.
        """
        user = self.context['request'].user
        
        is_owner = category_sector.enterprise.owner == user
        is_manager = category_sector.manager == user
        is_adm = SectorUser.objects.filter(user=user, sector=category_sector, is_adm=True).exists()

        if not (is_owner or is_manager or is_adm):
            raise serializers.ValidationError("Você não tem permissão para criar documentos neste setor.")
            
        return category_sector
    
        
    def create(self, validated_data):
        """
        Cria o a categoria.
        
        Args:
            validate_data (dict): Dados validados para criação da Categoria.
            
        Returns:
            Category: Categoria criada.
        """        
        sector = validated_data.pop('category_sector')
        enterprise = sector.enterprise
        is_public = validated_data.get('is_public', False)
        
        if is_public == 'True':
            is_public = True
        else:
            is_public = False
        
        print(validated_data)
        
        category = Category.objects.create(
            category_enterprise=enterprise,
            category_sector=sector,
            **validated_data
            )
        
        if is_public:
            category.is_public = True
            category.save()
    
        return category

        

    class Meta:
        model = Category
        fields = [
            'category',
            'description',
            'category_sector',
            'category_enterprise',
            'is_public',
        ]
        
class CategoryListSerializer(serializers.ModelSerializer):
    """
    Serializer "leve" para a listagem de Categorias, incluindo
    os nomes das suas relações (Empresa e Setor).
    """
    sector_name = serializers.CharField(source='category_sector.name', read_only=True)
    enterprise_name = serializers.CharField(source='category_enterprise.name', read_only=True)
    class Meta:
        model = Category
        fields = [
            'category_id',
            'category',
            'description',
            'sector_name',
            'enterprise_name',
            'is_public',
        ]
        
class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os detalhes de uma Categoria.
    """
    enterprise_name = serializers.CharField(source='category_enterprise.name', read_only=True)
    sector_name = serializers.CharField(source='category_sector.name', read_only=True, allow_null=True)

    class Meta:
        model = Category
        fields = [
            'category_id',
            'category',
            'description',
            'is_public',
            'enterprise_name',
            'sector_name'
        ]
        
class UpdateCategorySerializer(serializers.ModelSerializer):
    """
    Serializer para a atualização (PATCH) de uma Categoria.
    Valida os campos que podem ser alterados.
    """
    category = serializers.CharField(min_length=3, max_length=100, required=False)
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    category_sector = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
        required=False,
        allow_null=True
    )
    is_public = serializers.BooleanField(required=False)

    class Meta:
        model = Category
        fields = ['category', 'description', 'category_sector', 'is_public']

    def validate_category(self, value):
        """
        Garante que o novo nome da categoria não entre em conflito
        com outro nome na mesma empresa.
        """
        enterprise = self.instance.category_enterprise # type: ignore
        if Category.objects.filter(
            category_enterprise=enterprise, 
            category=value
        ).exclude(pk=self.instance.pk).exists():# type: ignore
            raise serializers.ValidationError("Uma categoria com este nome já existe nesta empresa.")
        return value
    
class DeleteCategorySerializer(serializers.Serializer):
    """
    Validador para a exclusão de Categoria.
    
    Garante que a categoria não está sendo usada por
    nenhum documento antes de ser excluída.
    Este serializer não possui campos, ele usa apenas o método validate().
    """
    
    def validate(self, data):
        """
        Verifica se a categoria (injetada como 'self.instance' pela view)
        tem algum documento associado.
        """
        category = self.instance 
        
        document_count = category.documents.count() # type: ignore

        if document_count > 0:
            raise serializers.ValidationError(
                f"Esta categoria não pode ser excluída. "
                f"Ela está associada a {document_count} documento(s). "
                "Primeiro, remova todos os documentos desta categoria."
            )
        
        return data
    
class DocumentAddCategoriesSerializer(serializers.Serializer):
    """
    Serializer para validar uma lista de IDs de categoria.
    
    Ele espera receber o objeto 'document' no 'context'
    da view para validar se as categorias pertencem
    à mesma empresa do documento.
    """
    categories_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.select_related('category_enterprise').all(), 
        source='categories',
        many=True, 
        write_only=True,
        allow_empty=True 
    )

    class Meta:
        fields = ['categories_id']

    def validate(self, data):
        """
        Validação cruzada: Garante que as categorias 
        pertencem à empresa do documento (fornecido via context).
        """
        categories_to_add = data.get('categories', [])
        
        document = self.context.get('document')

        if not document:
            raise serializers.ValidationError("Contexto do documento não fornecido.")

        doc_enterprise = document.sector.enterprise
        
        for category in categories_to_add:
            if category.category_enterprise != doc_enterprise:
                raise serializers.ValidationError(
                    f"A categoria '{category.category}' (ID: {category.pk}) "
                    f"não pertence à empresa do documento ({doc_enterprise.name})."
                )
        
        return data

class ListCategoriesByDocumentId(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            'category_id',
            'category',
            'description',
        ]