from django.db import models
from django.conf import settings
from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise
from .utils.asaas import AsaasService

class Plan_Status(models.Model):
    plan_status_id = models.AutoField(primary_key=True, db_column='PK_plan_status')
    plan_status = models.CharField(max_length=20, unique=True, db_column='plan_status')

    def __str__(self):
        return self.plan_status
    
    class Meta:
        db_table = 'Plan_Status'
        verbose_name = 'Plan Status'
        verbose_name_plural = 'Plan Statuses'
        
    @classmethod
    def get_default_pk(cls):
        status, created = cls.objects.get_or_create(
            plan_status_id=1,
            plan_status='Active'
        )
        return status.pk
        
class Plan_Type(models.Model):
    plan_type_id = models.AutoField(primary_key=True, db_column='PK_plan_type')
    plan_type = models.CharField(max_length=50, unique=True, db_column='plan_type')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, db_column='price_type')
    description = models.TextField(null=True, blank=True, db_column='description_type')
    features = models.JSONField(null=True, blank=True, db_column='features_type')
    is_active = models.BooleanField(default=True, db_column='is_active_type')
    is_most_popular = models.BooleanField(default=False, db_column='is_most_popular_type')
    order = models.PositiveIntegerField(default=0, db_column='order_type')
    is_free = models.BooleanField(default=False, db_column='is_free_type')
    is_price_under_review = models.BooleanField(default=False, db_column='is_price_under_review_type')
    
    def __str__(self):
        return self.plan_type
    
    class Meta:
        db_table = 'Plan_Type'
        verbose_name = 'Plan Type'
        verbose_name_plural = 'Plan Types'

class Plan(models.Model):
    plan_id = models.AutoField(primary_key=True, db_column='PK_plan')
    asaas_customer_id = models.CharField(max_length=50, unique=True, null=True, blank=True, db_column='asaas_customer_id_plan')
    asaas_subscription_id = models.CharField(max_length=50, null=True, blank=True, db_column='asaas_subscription_id_plan')
    payment_link = models.URLField(null=True, blank=True, db_column='payment_link_plan')
    next_due_date = models.DateField(null=True, blank=True, db_column='next_due_date_plan')
    purchase_at = models.DateTimeField(auto_now=True, db_column='purchase_at_plan')
    status = models.ForeignKey(Plan_Status, on_delete=models.CASCADE, default=Plan_Status.get_default_pk, db_column='FK_plan_status')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plan', db_column='FK_user_plan')
    plan_type = models.ForeignKey(Plan_Type, on_delete=models.SET_NULL, null=True, blank=True, db_column='FK_plan_type')

    class Meta:
        db_table = 'Plan'
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'
        ordering = ['-purchase_at']

    def __str__(self):
        return f"{self.user.email} - {self.status}"
    
    @classmethod
    def create_plan_for_user(cls, user):
        """
        Create a Plan instance for the given user, initializing the Asaas customer ID.
        
        Args:
            user (User): The user for whom the plan is to be created.
        """
        try:
            customer_id = AsaasService().create_customer(user)
        except Exception as e:
            print(f"Erro ao criar cliente no Asaas: {e}")
        
        plan = cls.objects.create(
            user=user,
            asaas_customer_id=customer_id,
            status=Plan_Status.objects.get(plan_status_id=2)
        )
        
        return plan

    def create_subscription(self, plan_type: Plan_Type):
        """
        Create a subscription for the plan's user in Asaas.
        
        Args:
            plan_type (Plan_Type): The plan type to subscribe to.
        """
        sub_data = AsaasService().create_subscription(customer_id=self.asaas_customer_id, plan_type=plan_type)
        self.asaas_subscription_id = sub_data['id']
        self.save()
        return sub_data
    
class Plan_Subscription_Item(models.Model):
    plan_subscription_item_id = models.AutoField(primary_key=True, db_column='PK_plan_subscription_item')
    
    plan = models.ForeignKey(Plan, related_name='items', on_delete=models.CASCADE)
    
    enterprise = models.ForeignKey(
        Enterprise, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        unique=True,
        related_name='active_plan_items',
        db_column='FK_enterprise_plan_item'
    )
    
    sector = models.ForeignKey(
        Sector, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        unique=True,
        related_name='active_plan_items',
        db_column='FK_sector_plan_item'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Plan_Subscription_Item'
        verbose_name = 'Plan Subscription Item'
        verbose_name_plural = 'Plan Subscription Items'
    
    def __str__(self):
        return f"{self.plan.plan_type.plan_type} - Item {self.pk}" # type: ignore
    