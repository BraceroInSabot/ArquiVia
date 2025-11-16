from rest_framework import serializers
from apps.APIDocumento.models import Document

class DashboardDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para os cards de documentos.
    """
    status_label = serializers.CharField(source='classification.classification_status.status', default="Sem Status")
    
    class Meta:
        model = Document
        fields = ['document_id', 'title', 'created_at', 'status_label']

class ActivityLogSerializer(serializers.Serializer):
    """
    Serializer para padronizar o Feed de Atividades (AuditLog + SimpleHistory).
    O Front-end receberá uma lista uniforme, não importa a origem do dado.
    """
    timestamp = serializers.DateTimeField()
    message = serializers.CharField() 
    action_type = serializers.CharField()
    metadata = serializers.JSONField()
   