from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.APISetor.utils.vincular_colaborador_setor import vincular

User = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    codigochave = serializers.CharField(write_only=True, required=True) 
    username = serializers.CharField(write_only=True, required=True)
    nome = serializers.CharField(write_only=True, required=True) 

    class Meta:
        model = User
        fields = ['username', 'nome', 'email', 'password', 'codigochave']
    
    def create(self, validated_data):
        cod_chave = validated_data.pop('codigochave')
        
        user = User(
            username=validated_data['username'],
            nome=validated_data['nome'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        
        if vincular(user, cod_chave):
            return {"Sucesso": "Usuário criado e vinculado ao setor com sucesso!"}
        else:
            return {"Falha": "Houve um erro no processo de vinculação do colaborador ao setor!"}
            
        
        


        
