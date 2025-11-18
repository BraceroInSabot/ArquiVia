# DRF
from rest_framework import serializers

# PROJECT
from .models import Enterprise
from apps.APISetor.models import Sector

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ['sector_id', 'name', 'is_active']

class EnterpriseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Enterprise model.
    """
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    sectors = SectorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Enterprise
        fields = [
            'enterprise_id', 
            'name', 
            'image', 
            'owner',
            'owner_name', 
            'is_active', 
            'created_at',
            'sectors',
        ]
        read_only_fields = [
            'enterprise_id', 
            'owner', 
            'is_active', 
            'created_at'
        ]

class EnterpriseToggleActiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enterprise
        fields = ['enterprise_id', 'is_active']