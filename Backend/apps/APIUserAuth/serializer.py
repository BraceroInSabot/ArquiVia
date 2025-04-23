from rest_framework import serializers,status
from django.contrib.auth import get_user_model
from apps.APISetor.utils.vincular_colaborador_setor import vincular
from rest_framework.response import Response
from apps.APIUserAuth.utils.validacoes import ValidacaoAutenticacao

User = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    cpassword = serializers.CharField(write_only=True)
    codigochave = serializers.CharField(write_only=True, required=True) 
    username = serializers.CharField(write_only=True, required=True)
    nome = serializers.CharField(write_only=True, required=True) 
    email = serializers.CharField(write_only=True, required=True) 

    class Meta:
        model = User
        fields = ['username', 'nome', 'email', 'password', 'cpassword', 'codigochave']
    
    def create(self, validated_data):
        """Cria um novo usuário no banco de dados e vincula o usuário a um setor. Possui verificações para cada campo de dados.

        Args:
            validated_data dict: Dados recebidos do cliente para criação de um novo usuário.

        Returns:
            dict: Descrição do resultado da operação.
        """

        response = Response().data
        try:
            cod_chave = validated_data.pop('codigochave')
        except:
            response = {"Falha": "Código de chave não informado!"}
            return response

        validacao = ValidacaoAutenticacao(
            validated_data['username'], 
            validated_data['nome'], 
            validated_data['email'], 
            validated_data['password'], 
            validated_data['cpassword']
            ).validar_tudo()
        
        if  validacao[0] == False:
            response = {"Falha": f"Dados de usuário invalidos! {validacao}"}
            raise serializers.ValidationError(response, code=status.HTTP_400_BAD_REQUEST)

        try:
            user = User(
                username=validated_data['username'],
                nome=validated_data['nome'],
                email=validated_data['email'],
            )
            user.set_password(validated_data['password'])
            user.save()
        except:
            response={"Falha": "Usuário informado já existe no banco!"}
            return response
        
        try:        
            print(user, cod_chave)
            vincular(user, cod_chave)
            response={"Sucesso": "Usuário criado com sucesso!"}
            return response
        except:
            response={"Falha": "Houve um erro no processo de vinculação do usuário com o setor!"}
            return response
        