

from rest_framework import serializers
from .models import Sector
from apps.APIEmpresa.models import Enterprise

class SectorCreateSerializer(serializers.ModelSerializer):


    enterprise_id = serializers.PrimaryKeyRelatedField(
        queryset=Enterprise.objects.all(),
        source='enterprise',
        write_only=True
    )

    class Meta:
        model = Sector
    
        fields = ['name', 'image', 'enterprise_id']

    def validate(self, data):
        """
        Validação customizada para verificar se o nome do setor já existe na empresa.
        """
    
        request_user = self.context['request'].user
        enterprise = data.get('enterprise')
        name = data.get('name')
        
        if enterprise.owner != request_user:
            raise serializers.ValidationError("Você não é o proprietário desta empresa e não pode criar setores nela.")
        

        if Sector.objects.filter(enterprise=enterprise, name=name).exists():
            raise serializers.ValidationError("Um setor com este nome já existe nesta empresa.")
        
        return data

    def create(self, validated_data):
        """
        Sobrescreve o método create para definir o manager do setor
        como o dono da empresa.
        """
    
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
    Serializer for listing Sector details along with the user's hierarchy level.
    """
    manager_id = serializers.IntegerField(source='manager.pk', read_only=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    enterprise_name = serializers.CharField(source='enterprise.name', read_only=True)
    enterprise_id = serializers.IntegerField(source='enterprise.pk', read_only=True) # Add enterprise ID
    owner_id = serializers.IntegerField(source='enterprise.owner.pk', read_only=True)
    owner_name = serializers.CharField(source='enterprise.owner.name', read_only=True)
    creation_date = serializers.DateTimeField(format="%H:%M:%S - %d-%m-%Y", read_only=True) # type: ignore
    
    # Add a field to accept the hierarchy level from the view context
    hierarchy_level = serializers.CharField(read_only=True) 

    class Meta:
        model = Sector
        fields = [
            'sector_id', 
            'name', 
            'manager_id', 
            'manager_name', 
            'image', 
            'creation_date', 
            'enterprise_id', # Added ID
            'enterprise_name',
            'owner_id',
            'owner_name', 
            'is_active',
            'hierarchy_level' # Added hierarchy
        ]
        
class SectorUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for return Sector details efficiently when editted.
    """
    name = serializers.CharField(max_length=200, required=False)
    image = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    class Meta:
        model = Sector
        fields = ['name', 'image']


    def validate_name(self, value):
    
        if self.instance and Sector.objects.filter(
            enterprise=self.instance.enterprise, name=value
        ).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Um setor com este nome já existe nesta empresa.")
        return value