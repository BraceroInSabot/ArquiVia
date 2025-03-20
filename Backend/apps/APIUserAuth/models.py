from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin

class Colaborador(AbstractUser, PermissionsMixin):
    imagem = models.CharField(max_length=255, null=True)
    nome = models.CharField(max_length=100)
    horario_inicio_expediente = models.DateTimeField(blank=True, default=None, null=True)
    horario_final_expediente = models.DateTimeField(blank=True, default=None, null=True)

    class Meta:
        db_table = "Colaborador"

        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"
        
    def __str__(self):
        return self.nome