# DRF
from rest_framework.response import Response
from rest_framework import serializers,status

# DJANGO
from django.contrib.auth import get_user_model

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

    class Meta:
        model = User
        fields = ['username', 'name', 'email', 'password', 'cpassword']

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

        if isinstance(validation, list):
            attribute = validation[1][0] #type: ignore
            error = validation[1][1] #type: ignore
            raise serializers.ValidationError(
                {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": f"Erro na validação do campo {attribute}: {error}"
                    }}
            )
        
        if User.objects.filter(username=attrs.get('username')).exists():
            raise serializers.ValidationError(
                {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Usuário com o mesmo nome já existe."
                    }}
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
        user = User.objects.create_user(**validated_data)
        
        return user #type: ignore
    