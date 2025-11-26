from rest_framework import serializers
from apps.APIDocumento.models import Document

class DocumentHistorySerializer(serializers.ModelSerializer):
    """
    Serializa as versões passadas do documento.
    """
    user_name = serializers.CharField(source='history_user.name', default='Sistema/Anônimo', read_only=True)
    action = serializers.SerializerMethodField()
    
    class Meta:
        model = Document.history.model # type: ignore
        fields = [
            'history_id',   # ID único da VERSÃO
            'history_date', # Data da mudança
            'user_name',    # Quem mudou
            'action',       # Criado, Editado ou Excluído
            'title',     # Título naquela época
            'content',  # Descrição naquela época
        ]

    def get_action(self, obj):
        actions = {
            '+': 'Criado',
            '~': 'Alterado',
            '-': 'Excluído'
        }
        return actions.get(obj.history_type, 'Desconhecido')