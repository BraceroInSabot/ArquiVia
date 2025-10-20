# Em APISetor/serializer.py

from rest_framework import serializers
from .models import Sector
from apps.APIEmpresa.models import Enterprise

class SectorCreateSerializer(serializers.ModelSerializer):
    # --- A MÁGICA ACONTECE AQUI ---
    # O campo no JSON será 'enterprise_id'
    enterprise_id = serializers.PrimaryKeyRelatedField(
        queryset=Enterprise.objects.all(),
        # source='enterprise' diz ao DRF: "pegue o valor deste campo
        # e use-o para preencher o campo 'enterprise' do modelo."
        source='enterprise',
        write_only=True
    )

    class Meta:
        model = Sector
        # A lista de campos agora usa 'enterprise_id'
        fields = ['name', 'image', 'enterprise_id']

    def validate(self, data):
        """
        Validação customizada para verificar se o nome do setor já existe na empresa.
        """
        # IMPORTANTE: Graças ao 'source', o DRF já converteu o 'enterprise_id'
        # em um objeto Enterprise completo e o colocou em 'data' com o nome 'enterprise'.
        enterprise = data.get('enterprise')
        name = data.get('name')

        if Sector.objects.filter(enterprise=enterprise, name=name).exists():
            raise serializers.ValidationError("Um setor com este nome já existe nesta empresa.")
        
        return data

    def create(self, validated_data):
        """
        Sobrescreve o método create para definir o manager do setor
        como o dono da empresa.
        """
        # O mesmo acontece aqui: 'validated_data' contém o objeto 'enterprise'.
        enterprise = validated_data.get('enterprise')
        
        sector = Sector.objects.create(
            enterprise=enterprise,
            manager=enterprise.owner, 
            name=validated_data.get('name'),
            image=validated_data.get('image')
        )
        return sector
    
class SectorDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os detalhes de um setor, incluindo nomes
    de campos relacionados.
    """
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    enterprise_name = serializers.CharField(source='enterprise.name', read_only=True)
    
    creation_date = serializers.DateTimeField(format="%H:%M:%S - %d-%m-%Y", read_only=True)  #type: ignore

    class Meta:
        model = Sector
        fields = [
            'sector_id', 
            'name', 
            'manager_name', 
            'image', 
            'creation_date', 
            'enterprise_name', 
            'is_active'
        ]
        
class SectorListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing Sector details efficiently.
    """
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    
    creation_date = serializers.DateTimeField(format="%H:%M:%S - %d-%m-%Y", read_only=True) #type: ignore

    class Meta:
        model = Sector
        fields = [
            'sector_id', 
            'name', 
            'manager_name', 
            'image', 
            'creation_date', 
            'is_active'
        ]