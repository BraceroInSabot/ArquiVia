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