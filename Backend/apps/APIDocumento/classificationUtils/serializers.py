from rest_framework.serializers import ModelSerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class ClassificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification_Status
        fields = ['status']

class ClassificationPrivacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification_Privacity
        fields = ['privacity']
        
class ReviewerSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'username']
        

class RetrieveClassificationSerializer(ModelSerializer):

    reviewer = ReviewerSerializer(read_only=True)
    
    classification_status = ClassificationStatusSerializer(read_only=True)
    
    privacity = ClassificationPrivacitySerializer(read_only=True)
    
    
    class Meta:
        model = Classification
        fields = [
            'classification_id',
            'is_reviewed',
            'classification_status',
            'reviewer',
            'privacity',
        ]
        
class UpdateClassificationSerializer(ModelSerializer):
    classification_status = serializers.PrimaryKeyRelatedField(
        queryset=Classification_Status.objects.all(),
        required=False,
        allow_null=True
    )
    privacity = serializers.PrimaryKeyRelatedField(
        queryset=Classification_Privacity.objects.all(),
        required=False,
        allow_null=True
    )
    reviewer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Classification
        fields = [
            'is_reviewed',
            'classification_status',
            'reviewer',
            'privacity',
        ]