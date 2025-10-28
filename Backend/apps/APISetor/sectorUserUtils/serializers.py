from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SectorUserRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying user details along with their role in a sector.
    Expects 'role' to be added to the instance or passed via context.
    """
    user_id = serializers.IntegerField(source='pk', read_only=True)
    user_name = serializers.CharField(source='name', read_only=True)
    user_email = serializers.EmailField(source='email', read_only=True)
    sector_user_id = serializers.IntegerField(read_only=True, allow_null=True)
    role = serializers.CharField(read_only=True) 

    class Meta:
        model = User
        fields = ['user_id', 'user_name', 'user_email', 'role', 'sector_user_id']
        