# NATIVE
import uuid
from datetime import timedelta

# DJANGO
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import AbstractUser, PermissionsMixin

class AbsUserManager(BaseUserManager):
    def create_user(self, username, email, name, password=None, **extra_fields): 
        """
        Create and save a User with the given username, email, name, and password.
        
        Args:
            username (str): User username
            email (str): User e-mail
            name (str): User name
            password (str): User password. Defaults to None.
            **extra_fields: Additional fields for the user model.
        
        Raises:
            ValueError: If the email is not provided.
        
        Returns:
            User: The created user instance.
        """       
        if not email:
            raise ValueError('O Email é um campo obrigatório')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, name, password=None, **extra_fields):
        """
        Return a error since superusers are not supported.

        Args:
            username (str): User username
            email (str): User e-mail
            name (str): User name
            password (str): User password. Defaults to None.

        Raises:
            NotImplementedError: Create superuser is not supported.
        """
        raise NotImplementedError("Método não suportado.")
    
    
class AbsUser(AbstractUser, PermissionsMixin):
    first_name = None
    last_name = None
    is_superuser = None
    is_staff = None

    user_id = models.AutoField(primary_key=True, db_column='PK_user')
    name = models.CharField(max_length=100, db_column='name_user')
    username = models.CharField(max_length=50, unique=True, db_column='username_user')
    email = models.EmailField(unique=True, blank=False, null=False, db_column='email_user')
    password = models.CharField(max_length=256, db_column='password_user')
    image = models.CharField(max_length=255, default='', db_column="image_user")
    date_joined = models.DateTimeField(auto_now=True, db_column='date_created_at_user')
    last_login = models.DateTimeField(null=True, db_column='date_last_login_user')
    is_active = models.BooleanField(default=True, db_column='is_active_user')
    objects = AbsUserManager() #type: ignore

    class Meta:
        db_table = "User"

        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.name


    

class PasswordResetToken(models.Model):
    reset_id = models.AutoField(primary_key=True, db_column='codigo_redefinicao')
    user_pk = models.ForeignKey(AbsUser, on_delete=models.CASCADE, db_column='FK_codigo_user_redefinicao')
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