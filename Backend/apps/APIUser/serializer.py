# DRF
from rest_framework.response import Response
from rest_framework import serializers,status

# DJANGO
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

# PROJECT
from apps.APIUser.utils.validate_user import ValidateAuth

# Typing
from django.conf import settings
from typing  import Dict, Type, Any
from .models import AbsUser as UserType

User = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    cpassword = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(write_only=True, required=True) 
    email = serializers.CharField(write_only=True, required=True) 
    image = serializers.ImageField(
        required=False, 
        allow_null=True 
    )

    class Meta:
        model = User
        fields = ['username', 'name', 'email', 'password', 'cpassword', 'image']

    def validate(self, attrs: dict) -> dict | serializers.ValidationError:
        """
        Validate the user data before creating a new user.
        
        Args:
            attrs (dict): The attributes to validate.

        Raises:
            serializers.ValidationError: If validation fails. Appoint the field and the error.

        Returns:
            Returns the validated attributes if validation is successful.
        """
        validation = ValidateAuth(
            username=attrs.get('username'),
            name=attrs.get('name'),
            email=attrs.get('email'),
            password=attrs.get('password'),
            c_password=attrs.get('cpassword')
        ).validate()
        
        if isinstance(validation, list) and len(validation) > 0:
            print(validation)
            raise serializers.ValidationError(
                [err for err in validation]
            )

        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Type[UserType]: 
        """
        Create a new user instance with the validated data.
        
        Args:
            validated_data (dict): The validated data for creating the user.

        Returns:
            User: The created user instance.
        """
        validated_data.pop('cpassword', None)
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)
        user = User.objects.create_user(**validated_data) #type: ignore
        
        return user #type: ignore

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os detalhes de um usuário de forma segura.
    """
    class Meta:
        model = User
        # Defina os campos que você quer que sejam visíveis na API
        fields = ['user_id', 'username', 'name', 'email', 'image']
        read_only_fields = ['user_id', 'username', 'name', 'email', 'image']
        
class UserEditSerializer(serializers.ModelSerializer):
    """
    Serializer para editar os detalhes de um usuário.
    """
    class Meta:
        model = User
        fields = ['name', 'email', 'image']
        
class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer específico para troca de senha.
    Exige a senha antiga para segurança e valida a força da nova senha.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    c_new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value: str):
        """
        Verifica se a senha antiga informada bate com a do usuário logado.
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Sua senha atual está incorreta.")
        return value

    def validate_new_password(self, value):
        """
        Usa os validadores nativos do Django (tamanho mínimo, complexidade, etc).
        """
        validation = ValidateAuth(password=value, c_password=self.initial_data.get('c_new_password')) # type: ignore
        validation = validation.validate_password()
        
        if isinstance(validation, list) and len(validation) > 0:
            raise serializers.ValidationError(
                [err for err in validation]
            )
            
        return value
    
    def validate(self, data):
        """
        Validação extra: Impede que a nova senha seja igual à antiga.
        """
        if data['old_password'] == data['new_password']:
             raise serializers.ValidationError(
                 {"new_password": "A nova senha deve ser diferente da atual."}
             )
        return data

class UserSearchSerializer(serializers.ModelSerializer):
    """
    Serializer leve para listagem de usuários (busca).
    """
    class Meta:
        model = User
        fields = ['user_id', 'name',]
        read_only_fields = ['user_id', 'name',]