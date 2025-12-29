from rest_framework.serializers import ModelSerializer
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status
from apps.APIAudit.models import AuditLog
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

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
        
class ReviewDetailsSerializer(serializers.ModelSerializer):
    review_age_days = serializers.SerializerMethodField()
    last_review_date_from_log = serializers.SerializerMethodField()

    class Meta:
        model = Classification
        fields = ['review_age_days', 'last_review_date_from_log']
    
    def get_last_review_date_from_log(self, obj):
        """
        Busca a última data no log.
        """
        last_log = AuditLog.objects.filter(
            target_model='Classification',
            action="~",
            target_id=obj.classification_id,
        ).order_by('timestamp').first()

        if last_log:
            return last_log.timestamp
        
        return None

    def get_review_age_days(self, obj):
        """
        Calcula a idade da revisão em dias.
        """
        last_date = self.get_last_review_date_from_log(obj)
        
        if not last_date:
            return None
            
        delta = timezone.now() - last_date
        return delta.days
        

class RetrieveClassificationSerializer(ModelSerializer):

    reviewer = ReviewerSerializer(read_only=True)
    
    classification_status = ClassificationStatusSerializer(read_only=True)
    
    privacity = ClassificationPrivacitySerializer(read_only=True)
    
    review_details = ReviewDetailsSerializer(source='*', read_only=True)
    
    
    class Meta:
        model = Classification
        fields = [
            'classification_id',
            'is_reviewed',
            'classification_status',
            'reviewer',
            'review_details',
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