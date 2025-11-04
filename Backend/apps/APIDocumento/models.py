from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.contrib.postgres.indexes import GinIndex
from django.db import models

User = get_user_model()


class Document(models.Model):
    document_id = models.AutoField(primary_key=True, db_column='PK_document')
    title = models.CharField(max_length=200, db_column='title_document')
    content = models.JSONField(blank=True, null=True, db_column='content_document')
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='FK_creator_document')
    sector = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, db_column='FK_sector_document')
    categories = models.ManyToManyField(
        'Category',
        related_name='documents',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_column='date_created_at_document')
    is_active = models.BooleanField(default=False, db_column='is_active_document')

    def __str__(self):
        return self.title 
    
    class Meta:
        db_table = 'Document'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        # Otimiza a recuperação de informação
        # Acelera consultas em colunas que possuem o tipo de dado = JSON ou JSONB
        indexes = [
            GinIndex(fields=['content'], name='document_content_gin_idx'),
        ]
        
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
    
    @classmethod
    def get_default_status(cls):
        return cls.objects.get_or_create(status='Em andamento')[0].pk
    
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
        default=Classification_Status.get_default_status, 
        db_column='FK_status_classification', 
        null=False)
    reviewer = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        db_column='FK_reviewer_classification', 
        related_name='reviewed_by_user')
    document = models.OneToOneField(
        Document, 
        on_delete=models.CASCADE, 
        db_column='FK_document_classification',
        related_name='classification')
    privacity = models.ForeignKey(
        'Classification_Privacity', # Está assim pq não foi criada ainda
        on_delete=models.PROTECT, 
        db_column='FK_privacity_classification', 
        null=True)

    def __str__(self):
        return f"{self.document.title} - {self.is_reviewed}" 
    
    class Meta:
        db_table = 'Classification'
        verbose_name = 'Classification'
        verbose_name_plural = 'Classifications'
        
class Classification_Privacity(models.Model):
    privacity_choices = [
        ('PB', 'Publico'),
        ('PV', 'Privado'),
    ]
    
    classification_privacity_id = models.AutoField(primary_key=True, db_column='PK_classification_privacity')
    privacity = models.CharField(
        max_length=20, 
        unique=True, 
        choices=privacity_choices, 
        db_column='privacity_classification_privacity')
    privacity_abreviation = models.CharField(
        max_length=1, 
        unique=True, 
        default=None, 
        null=True, 
        db_column='abreviation_classification_privacity')

    def __str__(self):
        return self.privacity 
    
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
    

    def __str__(self):
        return self.category 
    
    class Meta:
        db_table = 'Category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'