from rest_framework.serializers import ModelSerializer
from apps.APIDocumento.models import Category
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
        max_length=1000, 
        required=False
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

        if not (is_owner or is_manager):
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
        
        category = Category.objects.create(
            category_enterprise=enterprise,
            category_sector=sector,
            **validated_data
            )
    
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
    enterprise_name = serializers.CharField(source='category_enterprise.name', read_only=True)
    sector_name = serializers.CharField(source='category_sector.name', read_only=True, default=None)

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