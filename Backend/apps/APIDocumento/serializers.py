from rest_framework import serializers
from django.db import transaction

from apps.core.presigned_url import generate_presigned_url 
from .models import Attached_Files_Document, Document, Classification, Category, Classification_Status, Classification_Privacity
from apps.APISetor.models import Sector, SectorUser
from apps.core.utils import optimize_image
from typing import List, Dict
from django.contrib.auth import get_user_model

User = get_user_model()

class DocumentCreateSerializer(serializers.ModelSerializer):
    
    privacity_id = serializers.PrimaryKeyRelatedField(
        source='privacity',
        queryset=Classification_Privacity.objects.all(),
        write_only=True
    )
    
    sector = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
    )
    
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        required=False,
    )
    
    content = serializers.JSONField()

    class Meta:
        model = Document
        fields = ['content', 'sector', 'categories', 'privacity_id']

    def validate_sector(self, sector):
        user = self.context['request'].user
        
        is_owner = sector.enterprise.owner == user
        is_manager = sector.manager == user
        is_member = SectorUser.objects.filter(user=user, sector=sector).exists()

        if not (is_owner or is_manager or is_member):
            raise serializers.ValidationError("Você não tem permissão para criar documentos neste setor.")
            
        return sector

    def validate(self, data):
        """
        Validação cruzada entre campos.
        Verifica se a privacidade é 'Exclusivo' (ID 3) e exige a lista de usuários.
        """
        privacity_obj = data.get('privacity') 
        users_ids = self.context['user_exclusive_access'] if 'user_exclusive_access' in self.context else []
        if privacity_obj.pk == 3: 
            if not users_ids:
                raise serializers.ValidationError({
                    "users_exclusive_access": "Para documentos exclusivos, é necessário fornecer a lista de usuários."
                })
            
            count = User.objects.filter(pk__in=users_ids).count()
            if count != len(users_ids):
                raise serializers.ValidationError({
                    "users_exclusive_access": "Um ou mais IDs de usuário fornecidos são inválidos."
                })

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        
        categories = validated_data.pop('categories', [])
        privacity_obj = validated_data.pop('privacity')
        users_ids =  self.context['user_exclusive_access'] if 'user_exclusive_access' in self.context else []
        with transaction.atomic():
            try:
                status_padrao = Classification_Status.objects.get(status='Em andamento')
            except Classification_Status.DoesNotExist:
                raise serializers.ValidationError("Erro interno: Status padrão 'Em andamento' não encontrado.")
            
            classification = Classification.objects.create(
                classification_status=status_padrao,
                privacity=privacity_obj,
                reviewer=None,
                is_reviewed=False
            )
            
            if privacity_obj.pk == 3 and users_ids:
                users_objs = User.objects.filter(pk__in=users_ids)
                
                # Inclusão dos usuários exclusivos selecionados
                for user_o in users_objs:
                    classification.exclusive_users.add(user_o) # type: ignore
                    
                # Inclusão do criador
                classification.exclusive_users.add(user) # type: ignore
                
            title = "Novo Documento"
            file_url = None
            if self.context.get('file_obj'):
                file_obj = self.context['file_obj']
                file_url = file_obj
                title = getattr(file_obj, 'name', title)

            documento = Document.objects.create(
                title=title,
                file_url=file_url,
                creator=user,
                classification=classification,
                **validated_data
            )
            
            if categories:
                documento.categories.set(categories)
            
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

class DocumentListSerializer(serializers.ModelSerializer):
    """
    Serializer "leve" para a listagem de documentos.
    Retorna apenas metadados essenciais, excluindo o 'content' pesado.
    """
    
    document_id = serializers.IntegerField(source='pk', read_only=True)
    
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    
    created_at = serializers.DateTimeField(format="%H:%M:%S - %d-%m-%Y", read_only=True) # type: ignore
    
    sector = serializers.CharField(source='sector.name', read_only=True)
    
    enterprise = serializers.CharField(source='sector.enterprise.name', read_only=True)
    
    is_uploaded_document = serializers.BooleanField(source='file_url', read_only=True)
    
    categories_data = serializers.SerializerMethodField()
    
    download_url = serializers.SerializerMethodField()
    
    def get_download_url(self, obj: Document) -> None | str:
        return generate_presigned_url(obj.file_url) # type: ignore
    
    def get_thumbnail_url(self, obj: Document) -> None | str:
        return generate_presigned_url(obj.thumbnail_path) # type: ignore

    
    def get_categories_data(self, obj: Document) -> List[Dict[str, str]]:
        """
        Search for categories linked to document object.
        """
        categories_data = []

        for category in obj.categories.all():
            categories_data.append({
                'category': category.category,
                'color': category.color
            })
            
        return categories_data

    class Meta:
        model = Document
        fields = [
            'document_id', 
            'title', 
            'creator_name', 
            'created_at', 
            'is_active', 
            'sector', 
            'enterprise', 
            'categories_data',
            'file_url',
            'download_url',
            'thumbnail_path',
            'is_uploaded_document'
        ]
        
class DocumentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer "leve" para a atualização de um documento.
    Valida os campos 'title' e 'content'.
    """
    title = serializers.CharField(
        max_length=200, 
        min_length=3, 
        required=False 
    )
    
    content = serializers.JSONField(
        required=False 
    )

    class Meta:
        model = Document
        fields = ['title', 'content']

class AttachFileSerializer(serializers.ModelSerializer):
    """
    Serializer para upload de arquivos anexos.
    Valida o título e o arquivo.
    """
    file = serializers.FileField(required=True)
    title = serializers.CharField(max_length=100, required=True)

    class Meta:
        model = Attached_Files_Document
        fields = [
            'attached_file_id', 
            'title', 
            'file', 
            'attached_at', 
        ]
        read_only_fields = ['attached_file_id', 'attached_at']

    def validate_file(self, value):
        """
        Validação opcional de tamanho ou tipo de arquivo.
        Also optimizes images before upload.
        
        Args:
            value (FileField): Arquivo a ser validado.
            
        Raises:
            serializers.ValidationError: Se o arquivo ultrapassar o limite.
        """
        limit_mb = 50
        if value.size > limit_mb * 1024 * 1024:
            raise serializers.ValidationError(f"O arquivo não pode exceder {limit_mb}MB.")
        
        # Optimize image if it's an image file
        optimized = optimize_image(
            value,
            max_width=1920,
            max_height=1920,
            quality=85,
            convert_to_jpeg=True
        )
        if optimized:
            return optimized
        
        return value
