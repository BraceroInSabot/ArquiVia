from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin
import uuid
from django.utils.timezone import now
from datetime import timedelta

class AbsUser(AbstractUser, PermissionsMixin):
    first_name = None
    last_name = None
    is_superuser = None
    is_staff = None

    user_id = models.AutoField(primary_key=True, db_column='ID_user')
    name = models.CharField(max_length=100, db_column='user_name')
    username = models.CharField(max_length=50, unique=True, db_column='user_username')
    email = models.EmailField(db_column='user_email')
    password = models.CharField(max_length=256, db_column='user_password')
    image = models.CharField(max_length=255, default='', db_column="user_image")
    date_joined = models.DateTimeField(auto_now=True, db_column='date_joined')
    last_login = models.DateTimeField(null=True, db_column='date_last_login')
    is_active = models.BooleanField(default=True, db_column='is_active')

    class Meta:
        db_table = "User"

        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.name


class PasswordResetToken(models.Model):
    reset_id = models.AutoField(primary_key=True, db_column='ID_reset')
    user_pk = models.ForeignKey(AbsUser, on_delete=models.CASCADE, db_column='PK_user')
    token = models.CharField(max_length=48, unique=True, default=uuid.uuid4, db_column='reset_token')
    created_at = models.DateTimeField(auto_now_add=True, db_column='date_creation')

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
        return (f"{self.user_pk} -- {self.token}")