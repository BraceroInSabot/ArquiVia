from apps.APISetor.models import Sector
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
    is_eliminate = models.BooleanField(default=True, db_column='document_active')

    def __str__(self):
        return self.title 
    
    class Meta:
        db_table = 'Document'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        
class Classification(models.Model):
    classification_id = models.AutoField(primary_key=True, db_column='ID_classification')
    reviewClassificationStatus = models.BooleanField(default=False, db_column='classification_review_status')
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
    privacity = models.CharField(max_length=20, choices=privacity_choices, db_column='privacity')
    priv_abreviation = models.CharField(max_length=2, default=None, null=True, db_column='abreviation')

    def __str__(self):
        return self.privacity 
    
    class Meta:
        db_table = 'Classification_Privacity'
        verbose_name = 'Classification Privacity'
        verbose_name_plural = 'Classifications Privacies'