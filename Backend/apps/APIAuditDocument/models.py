from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    """
    Log de auditoria leve para modelos de suporte (Category, Sector, etc).
    Usa JSONB para armazenar o 'diff' das alterações.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, 
        null=True,
        related_name='audit_logs',
        verbose_name="Usuário",
        db_column="PK_actor_audit",
        db_index=True
    )
    
    action = models.CharField(max_length=1, verbose_name="Ação") # + (CREATE), ~ (EDIT), - (DELETE)
    
    # Indica o nome da tabela
    target_model = models.CharField(max_length=100, db_column="target_audit", db_index=True)
    # Indica o ID/PK da linha alvo
    target_id = models.IntegerField(db_column="target_id_audit", db_index=True) 
    # Indica o título, nome ou categoria do objeto
    target_str = models.CharField(max_length=200, verbose_name="Resumo", db_column="target_tag_audit", db_index=True)
    
    timestamp = models.DateTimeField(auto_now_add=True, db_column="timestamp_audit", db_index=True)
    
    # Indica valores antigos e novos
    changes = models.JSONField(default=dict, blank=True, null=True, db_column="changes_audit") 

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Log de Atividade"
        indexes = [
            models.Index(fields=['target_model', 'target_id']),
        ]
        db_table="Audit_Log"

    def __str__(self):
        return f"[{self.timestamp}] {self.actor} - {self.action} {self.target_model}"
    