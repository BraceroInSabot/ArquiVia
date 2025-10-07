# DRF
from rest_framework import serializers

# PROJECT
from .models import Enterprise

class EnterpriseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Enterprise model.
    """
    owner_name = serializers.CharField(source='owner.name', read_only=True)

    class Meta:
        model = Enterprise
        fields = [
            'enterprise_id', 
            'name', 
            'image', 
            'owner',
            'owner_name', 
            'is_active', 
            'created_at'
        ]
        read_only_fields = [
            'enterprise_id', 
            'owner', 
            'is_active', 
            'created_at'
        ]
