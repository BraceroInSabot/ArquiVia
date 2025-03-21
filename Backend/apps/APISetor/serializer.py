from rest_framework import serializers
from .models import Setor, Colaborador_Setor

class SetorSerializer(serializers.ModelSerializer):

    class Meta:
        model=Setor
        fields={'codigoSetor', 'nomeSetor', 'codigoColaboradorGestor', 'ativoSetor',}