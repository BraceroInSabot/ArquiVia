from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin
import uuid
from django.utils.timezone import now
from datetime import timedelta

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


class PasswordResetToken(models.Model):
    codigo_reset = models.SmallAutoField(primary_key=True, db_column='CodigoRedefinição', verbose_name='Codigo de Redefinição')
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE, db_column='CodigoColaborador', verbose_name='Colaborador')
    token = models.CharField(max_length=48, unique=True, default=uuid.uuid4)
    criado_em = models.DateTimeField(auto_now_add=True)

    def is_token_valid(self):
        """Verifica se o token ainda é válido.

        Returns:
            bool: se estiver dentro do prazo, deve retornar True. Caso contrário, false.
        """
        return ( now() - self.criado_em <= timedelta(minutes=15) )
    
    class Meta:
        db_table = "RedefinirSenhaToken"

        verbose_name = "Redefinir"
        verbose_name_plural = "Redefinir Senhas"

    def __str__(self):
        return (f"{self.colaborador} -- {self.token}")