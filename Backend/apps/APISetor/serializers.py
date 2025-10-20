from rest_framework import serializers
from .models import Sector
from apps.APIEmpresa.models import Enterprise

class SectorCreateSerializer(serializers.ModelSerializer):
    enterprise = serializers.PrimaryKeyRelatedField(
        queryset=Enterprise.objects.all(),
        write_only=True  
    )

    class Meta:
        model = Sector
        fields = ['name', 'image', 'enterprise']

    def validate(self, data):
        """
        Validação customizada para verificar se o nome do setor já existe na empresa.
        
        Args: 
            data Dict[str, str]: Dados enviados para a criação da empresa.
            
        Returns:
            Dict[str, str]: Dados validados.
        
        Raises:
            serializers.ValidationError: Se o nome do setor já existir na empresa.
        """
        enterprise = data.get('enterprise')
        name = data.get('name')

        if Sector.objects.filter(enterprise=enterprise, name=name).exists():
            raise serializers.ValidationError("Um setor com este nome já existe nesta empresa.")
        
        return data

    def create(self, validated_data):
        """
        Sobrescreve o método create para definir o manager do setor
        como o dono da empresa.
        
        Args:
            validated_data Dict[str, str]: Dados validados.
            
        Returns:
            Sector: Instância do setor criado.
        """
        enterprise = validated_data.get('enterprise')
        
        sector = Sector.objects.create(
            enterprise=enterprise,
            manager=enterprise.owner, 
            name=validated_data.get('name'),
            image=validated_data.get('image')
        )
        return sector