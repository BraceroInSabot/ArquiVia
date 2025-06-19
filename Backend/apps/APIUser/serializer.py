from rest_framework import serializers,status
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from apps.APIUser.utils.validate_user import ValidateAuth

# Typing
from django.http import HttpResponse
from typing  import List, Dict
from django.conf import settings

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

    def validate(self, attrs):
        validation = ValidateAuth(
            username=attrs.get('username'),
            name=attrs.get('name'),
            email=attrs.get('email'),
            password=attrs.get('password'),
            c_password=attrs.get('cpassword')
        ).validate()

        if isinstance(validation, list):
            attribute = validation[1][0]
            error = validation[1][1]
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

    def create(self, validated_data):
        validated_data.pop('cpassword')

        user = User(
            username=validated_data['username'],
            name=validated_data['name'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
