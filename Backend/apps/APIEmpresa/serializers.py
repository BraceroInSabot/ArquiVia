# DRF
from rest_framework import serializers

# PROJECT
from .models import Enterprise
from apps.APISetor.models import Sector
from apps.core.utils import optimize_image

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
    
    def validate_image(self, value):
        """
        Optimize image before validation.
        """
        if value:
            optimized = optimize_image(
                value,
                max_width=1920,
                max_height=1920,
                quality=85,
                convert_to_jpeg=True
            )
            if optimized:
                return optimized
        return value

class EnterpriseToggleActiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enterprise
        fields = ['enterprise_id', 'is_active']