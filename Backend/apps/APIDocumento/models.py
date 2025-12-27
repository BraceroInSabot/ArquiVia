from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.contrib.postgres.indexes import GinIndex
from django.db import models
from apps.core.utils import rename_file_for_s3
from simple_history.models import HistoricalRecords

User = get_user_model()


class Document(models.Model):
    document_id = models.AutoField(primary_key=True, db_column='PK_document')
    title = models.CharField(max_length=200, default="Novo Documento", db_column='title_document')
    content = models.JSONField(blank=True, null=True, db_column='content_document')
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='FK_creator_document')
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, db_column='FK_sector_document')
    categories = models.ManyToManyField(
        'Category',
        related_name='documents',
        blank=True,
        db_column='FK_category_document',
        db_table='Document_Category'
    )
    classification = models.OneToOneField(
        'Classification', 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True, 
        db_column='FK_classification_document')
    created_at = models.DateTimeField(auto_now_add=True, db_column='date_created_at_document')
    is_active = models.BooleanField(default=True, db_column='is_active_document')
    
    history = HistoricalRecords(table_name='Document_Record')
    search_content = models.TextField(blank=True, null=True, db_column='search_content_document')

    def __str__(self):
        return self.title 
    
    class Meta:
        db_table = 'Document'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        indexes = [
            GinIndex(fields=['content'], name='document_content_gin_idx'),
        ]
        
class Attached_Files_Document(models.Model):
    attached_file_id = models.AutoField(primary_key=True, db_column='PK_attached_file')
    document_id = models.ForeignKey(
        Document, 
        on_delete=models.CASCADE, 
        db_column='FK_document_attached_file', 
        related_name='attached_files')
    title = models.CharField(max_length=100, db_column='title_attached_file')
    file = models.FileField(upload_to=rename_file_for_s3, db_column='file_attached_file')
    attached_at = models.DateTimeField(auto_now_add=True, db_column='date_attached_at_attached_file')
    detached_at = models.DateTimeField(null=True, blank=True, db_column='date_detached_at_attached_file')
    
    class Meta:
        db_table = 'Attached_Files_Document'
        verbose_name = 'Attached File'
        verbose_name_plural = 'Attached Files'
        
class Classification_Status(models.Model):
    status_choices = [
        ('C', 'Concluído'),
        ('E', 'Em andamento'),
        ('R', 'Revisão necessária'),
        ('A', 'Arquivado')
    ]
    
    status_id = models.AutoField(primary_key=True, db_column='PK_status')
    status = models.CharField(max_length=20, choices=status_choices, unique=True, db_column='status')

    def __str__(self):
        return self.status   
    
    class Meta:
        db_table = 'Classification_Status'
        verbose_name = 'Classification Status'
        verbose_name_plural = 'Classifications Statuses'
        
class Classification(models.Model):   
    classification_id = models.AutoField(primary_key=True, db_column='PK_classification')
    is_reviewed = models.BooleanField(default=False, db_column='review_status_classification')
    classification_status = models.ForeignKey(
        Classification_Status, 
        on_delete=models.PROTECT, 
        default=None, 
        db_column='FK_status_classification', 
        null=False)
    reviewer = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        db_column='FK_reviewer_classification', 
        related_name='reviewed_by_user')
    privacity = models.ForeignKey(
        'Classification_Privacity', # Está assim pq não foi criada ainda
        on_delete=models.PROTECT, 
        db_column='FK_privacity_classification', 
        null=True)

    def __str__(self):
        return f"Revisado por {self.reviewer}" 
    
    class Meta:
        db_table = 'Classification'
        verbose_name = 'Classification'
        verbose_name_plural = 'Classifications'
        
class Classification_Privacity(models.Model):    
    status_id = models.AutoField(primary_key=True, db_column='PK_status')
    is_public = models.BooleanField(default=False, db_column='is_public_status')
    is_private = models.BooleanField(default=False, db_column='is_private_status')
    is_exclusive = models.BooleanField(default=False, db_column='is_exclusive_status')
    exclusive_users = models.ManyToManyField(
        User,
        related_name='exclusivity',
        blank=True,
        db_table='Classification_Privacity_Exclusivity'
    )
    
    def __str__(self):
        if self.is_public:
            return 'Publico'
        elif self.is_private:
            return 'Privado'
        elif self.is_exclusive:
            return 'Exclusivo'
        else:
            return 'Status Indefinido'
    
    class Meta:
        db_table = 'Classification_Privacity'
        verbose_name = 'Classification Privacity'
        verbose_name_plural = 'Classifications Privacies'


class Category(models.Model):
    category_id = models.AutoField(primary_key=True, db_column='PK_category')
    category = models.CharField(max_length=100, db_index=True, db_column='name_category')
    description = models.TextField(db_column='description_category', null=True, blank=True)
    category_sector = models.ForeignKey(
        Sector, 
        on_delete=models.SET_NULL, 
        db_column='FK_sector_category',
        null=True, 
        blank=True)
    category_enterprise = models.ForeignKey(
        Enterprise, 
        on_delete=models.CASCADE, 
        db_column='FK_enterprise_category', 
        null=False, 
        blank=False)
    is_public = models.BooleanField(default=False, db_column='is_public_category')
    color = models.CharField(max_length=7, default='#FFFFFF', null=True, blank=True, db_column='color_category')
    

    def __str__(self):
        return self.category 
    
    class Meta:
        db_table = 'Category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'