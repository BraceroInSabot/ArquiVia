from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Document(models.Model):
    doc_id = models.AutoField(primary_key=True, db_column='ID_document')
    title = models.CharField(max_length=200, db_column='document_title')
    context_beta = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, db_column='document_creator')
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, db_column='document_sector')
    data_criacao = models.DateTimeField(auto_now_add=True, db_column='document_creation_date')
    is_eliminate = models.BooleanField(default=False, db_column='document_active')

    def __str__(self):
        return self.title 
    
    class Meta:
        db_table = 'Document'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        
class Classification_Status(models.Model):
    status_id = models.AutoField(primary_key=True, db_column='ID_status')
    status = models.CharField(max_length=20, db_column='status')

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
    classification_id = models.AutoField(primary_key=True, db_column='ID_classification')
    reviewClassificationStatus = models.BooleanField(default=False, db_column='classification_review_status')
    classification_status = models.ForeignKey(Classification_Status, on_delete=models.CASCADE, default=Classification_Status.get_default_status, db_column='classification_status', null=False)
    reviewedBy = models.ForeignKey(User, on_delete=models.CASCADE, db_column='classification_reviewed_by', related_name='reviewed_by_user')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, db_column='classification_document')
    privacity = models.ForeignKey('Classification_Privacity', on_delete=models.CASCADE, db_column='classification_privacity', null=True)

    def __str__(self):
        return f"{self.document.title} - {self.reviewClassificationStatus}" 
    
    class Meta:
        db_table = 'Classification'
        verbose_name = 'Classification'
        verbose_name_plural = 'Classifications'
        
class Classification_Privacity(models.Model):
    privacity_choices = [
        ('PB', 'Publico'),
        ('PV', 'Privado'),
    ]
    
    classification_privacity_id = models.AutoField(primary_key=True, db_column='ID_class_priv')
    privacity = models.CharField(max_length=20, choices=privacity_choices, db_column='privacity_name')
    priv_abreviation = models.CharField(max_length=2, default=None, null=True, db_column='abreviation')

    def __str__(self):
        return self.privacity 
    
    class Meta:
        db_table = 'Classification_Privacity'
        verbose_name = 'Classification Privacity'
        verbose_name_plural = 'Classifications Privacies'

class Classification_Category(models.Model):
    class_category_id = models.AutoField(primary_key=True, db_column='ID_class_category')
    classification = models.ForeignKey(Classification, on_delete=models.CASCADE, db_column='classification_id')
    category = models.ForeignKey('Category', on_delete=models.CASCADE, db_column='category_id')

    def __str__(self):
        return f"{self.classification.document.title} - {self.category.category}" 
    
    class Meta:
        db_table = 'Classification_Category'
        verbose_name = 'Classification Category'
        verbose_name_plural = 'Classifications Categories'

class Category(models.Model):
    category_id = models.AutoField(primary_key=True, db_column='ID_category')
    category = models.CharField(max_length=100, db_column='category_name')
    description = models.TextField(db_column='category_description', null=True, blank=True)
    category_sector = models.ForeignKey(Sector, on_delete=models.CASCADE, db_column='category_sector', null=True, blank=True)
    category_enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, db_column='category_enterprise', null=False, blank=False)

    def __str__(self):
        return self.category 
    
    class Meta:
        db_table = 'Category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'