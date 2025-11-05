from rest_framework import serializers
from django.db import transaction

from .models import Document, Classification, Category, Classification_Status, Classification_Privacity
from apps.APISetor.models import Sector, SectorUser

class DocumentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para a criação de um novo Documento.
    Ele lida com a validação, verificação de permissão e a criação
    transacional do Documento e sua Classificação associada.
    """
    
    sector = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
        help_text="ID do setor ao qual este documento pertence."
    )
    
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        required=False, 
        help_text="Lista de IDs de categorias para etiquetar o documento."
    )
    
    content = serializers.JSONField()

    class Meta:
        model = Document
        fields = ['content', 'sector', 'categories']
        
    def validate_sector(self, sector):
        """
        Método de validação customizado para o campo 'sector'.
        Verifica se o usuário tem permissão para postar neste setor.
        
        Args:
            sector (Sector): Setor encaminhado pelo usuário.
            
        Returns:
            Sector: Setor válido.
            
        Raises:
            serializers.ValidationError: Se o usuário não tiver permissão.
        """
        user = self.context['request'].user
        
        is_owner = sector.enterprise.owner == user
        is_manager = sector.manager == user
        is_member = SectorUser.objects.filter(user=user, sector=sector).exists()

        if not (is_owner or is_manager or is_member):
            raise serializers.ValidationError("Você não tem permissão para criar documentos neste setor.")
            
        return sector

    def create(self, validated_data):
        """
        Cria o Documento e sua Classificação associada.
        
        Args:
            validate_data (dict): Dados validados para criação do Documento.
            
        Returns:
            Document: Documento criado.
            
        Raises:
            serializers.ValidationError: Se a criação da Classificação falhar.
        """
        user = self.context['request'].user
        categories = validated_data.pop('categories', [])
        sector = validated_data.get('sector')
        
        with transaction.atomic(): # enquanto ok, faça. Se der errado, rollback
            documento = Document.objects.create(
                creator=user,
                **validated_data
            )
            
            if categories is not None:
                documento.categories.set(categories)
            
            try:
                status_padrao = Classification_Status.objects.get(status='Em Andamento')
                privacidade_padrao = Classification_Privacity.objects.get(privacity='Privado')
            except (Classification_Status.DoesNotExist, Classification_Privacity.DoesNotExist):
                raise serializers.ValidationError("Erro interno: Configuração de status/privacidade padrão não encontrada.")
            
            Classification.objects.create(
                document=documento,
                classification_status=status_padrao,
                privacity=privacidade_padrao,
                reviewer=sector.manager 
            )
            
        return documento

class ClassificationDetailSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='classification_status.status', read_only=True)
    privacity = serializers.CharField(source='privacity.privacity', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True, default=None)

    class Meta:
        model = Classification
        fields = ['is_reviewed', 'status', 'privacity', 'reviewer_name']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'category']

class DocumentDetailSerializer(serializers.ModelSerializer):
    document_id = serializers.IntegerField(source='pk')
    
    created_at = serializers.DateTimeField(format="%H:%M:%S - %d-%m-%Y", read_only=True) # type: ignore
    
    sector_id = serializers.IntegerField(source='sector.sector_id', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    
    classification = ClassificationDetailSerializer(read_only=True)
    
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = [
            'document_id', 
            'title', 
            'content', 
            'created_at', 
            'sector_id', 
            'sector_name', 
            'is_active',
            'classification',
            'categories'
        ]
        