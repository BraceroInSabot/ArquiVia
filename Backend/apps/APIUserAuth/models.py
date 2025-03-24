from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin


class Colaborador(AbstractUser, PermissionsMixin):
    codigocolaborador = models.SmallAutoField(primary_key=True, db_column='CodigoColaborador', verbose_name='Codigo do Colaborador')
    imagem = models.CharField(max_length=255, default=' ')
    nome = models.CharField(max_length=100)
    horario_inicio_expediente = models.TimeField(blank=True, null=True)
    horario_final_expediente = models.TimeField(blank=True, null=True)

    class Meta:
        db_table = "Colaborador"

        verbose_name = "Colaborador"
        verbose_name_plural = "Colaboradores"

    def __str__(self):
        return self.nome
