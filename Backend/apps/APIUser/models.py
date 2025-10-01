# NATIVE
import uuid
from datetime import timedelta

# DJANGO
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser, PermissionsMixin

class AbsUser(AbstractUser, PermissionsMixin):
    first_name = None
    last_name = None
    is_superuser = None
    is_staff = None

    user_id = models.AutoField(primary_key=True, db_column='codigo_usuario')
    name = models.CharField(max_length=100, db_column='nome_usuario')
    username = models.CharField(max_length=50, unique=True, db_column='usuario_usuario')
    email = models.EmailField(unique=True, blank=False, null=False, db_column='email_usuario')
    password = models.CharField(max_length=256, db_column='senha_usuario')
    image = models.CharField(max_length=255, default='', db_column="imagem_usuario")
    date_joined = models.DateTimeField(auto_now=True, db_column='data_cadastro_usuario')
    last_login = models.DateTimeField(null=True, db_column='data_ultimo_login_usuario')
    is_active = models.BooleanField(default=True, db_column='esta_ativo_usuario')

    class Meta:
        db_table = "User"

        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.name


class PasswordResetToken(models.Model):
    reset_id = models.AutoField(primary_key=True, db_column='codigo_redefinicao')
    user_pk = models.ForeignKey(AbsUser, on_delete=models.CASCADE, db_column='FK_codigo_usuario_redefinicao')
    token = models.CharField(max_length=48, unique=True, default=uuid.uuid4, db_column='token_redefinicao') # type: ignore
    created_at = models.DateTimeField(auto_now_add=True, db_column='data_criacao_redefinicao')

    def is_token_valid(self):
        """Verifica se o token ainda é válido.

        Returns:
            bool: se estiver dentro do prazo, deve retornar True. Caso contrário, false.
        """
        return ( now() - self.created_at <= timedelta(minutes=15) )
    
    class Meta:
        db_table = "ResetToken"

        verbose_name = "Redefinir"
        verbose_name_plural = "Redefinir Senhas"

    def __str__(self):
        return (f"{self.user_pk} / {self.token}")