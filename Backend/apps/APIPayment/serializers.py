from rest_framework import serializers
from .models import Plan, Plan_Type

class PlanDashboardSerializer(serializers.ModelSerializer):
    has_plan = serializers.SerializerMethodField()
    plan_details = serializers.SerializerMethodField()
    usage = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ['has_plan', 'plan_details', 'usage']

    def get_has_plan(self, obj):
        return True

    def get_plan_details(self, obj):
        return {
            'id': obj.pk,
            'name': obj.plan_type.plan_type if obj.plan_type else "Plano Desconhecido",
            'status': obj.status.plan_status,
            'status_color': 'green' if obj.status.plan_status == 'Active' else 'red',
            'next_due_date': obj.next_due_date,
            'payment_link': obj.payment_link
        }

    def get_usage(self, obj):
        used_enterprises = obj.items.filter(enterprise__isnull=False).count()
        used_sectors = obj.items.filter(sector__isnull=False).count()

        features = obj.plan_type.features if (obj.plan_type and obj.plan_type.features) else {}
        
        limit_enterprises = features.get('enterprises', 0)
        limit_sectors = features.get('sectors', 0)

        pct_enterprises = (used_enterprises / limit_enterprises * 100) if limit_enterprises > 0 else 100
        pct_sectors = (used_sectors / limit_sectors * 100) if limit_sectors > 0 else 100

        return {
            'enterprises': {
                'used': used_enterprises,
                'limit': limit_enterprises,
                'percentage': round(pct_enterprises, 2)
            },
            'sectors': {
                'used': used_sectors,
                'limit': limit_sectors,
                'percentage': round(pct_sectors, 2)
            }
        }
        
class Plan_Type_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Plan_Type
        fields = [
            'plan_type_id', 
            'plan_type', 
            'price', 
            'description', 
            'features', 
            'is_active',
            'is_most_popular',
            'order',
            'is_free',
            'is_price_under_review'
            ]