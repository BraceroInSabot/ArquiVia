from rest_framework.serializers import ModelSerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status
from rest_framework import serializers

class ClassificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification_Status
        fields = ['status']

class ClassificationPrivacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification_Privacity
        fields = ['privacity', 'privacity_abreviation']

class RetrieveClassificationSerializer(ModelSerializer):
    
    reviewer = serializers.CharField(
        source='reviewer.name',
        read_only=True,
        allow_null=True # Adicionado para permitir que o revisor seja nulo
    )
    
    classification_status = ClassificationStatusSerializer(read_only=True)
    
    privacity = ClassificationPrivacitySerializer(read_only=True)
    
    
    class Meta:
        model = Classification
        fields = [
            'classification_id',
            'is_reviewed',
            'classification_status',
            'reviewer',
            'document',
            'privacity',
        ]
        
        
"""
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
"""