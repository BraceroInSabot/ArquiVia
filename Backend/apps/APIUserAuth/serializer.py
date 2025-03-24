from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.APISetor.utils.vincular_colaborador_setor import vincular
from rest_framework.response import Response

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
        response = Response().data
        try:
            cod_chave = validated_data.pop('codigochave')
        except:
            return Response(data={"Falha": "Código de chave não informado!"})
        
        try:
            user = User(
                username=validated_data['username'],
                nome=validated_data['nome'],
                email=validated_data['email'],
            )
            user.set_password(validated_data['password'])
            user.save()
            print('Criou!')
        except:
            response={"Falha": "Usuário informado já existe no banco!"}
            print(222323)
            return response
        
        try:        
            print(user, cod_chave)
            vincular(user, cod_chave)
            response={"Sucesso": "Usuário criado com sucesso!"}
            return response
        except:
            print(12313131245123)
            response={"Falha": "Houve um erro no processo de vinculação do usuário com o setor!"}
            return response
        
            
        
        


        
