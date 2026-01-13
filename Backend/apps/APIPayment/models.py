from django.db import models
from django.conf import settings
from apps.APISetor.models import Sector
from apps.APIEmpresa.models import Enterprise

class Plan_Discount(models.Model):
    plan_discount_id = models.AutoField(primary_key=True, db_column='PK_plan_discount')
    discount_title = models.CharField(max_length=100, null=True, blank=True, db_column='discount_title_plan_discount')
    percentage = models.DecimalField(null=True, blank=True, max_digits=5, decimal_places=2, db_column='percentage_plan_discount')
    fixed_value = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2, db_column='fixed_value_plan_discount')

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
    discount = models.ForeignKey(Plan_Discount, on_delete=models.SET_NULL, null=True, blank=True, db_column='FK_plan_discount')
    free_trial_days = models.PositiveIntegerField(null=True, blank=True, db_column='free_trial_days_type')
    
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
    # -- Quando foi solicitado a compra, não o pagamento
    purchase_at = models.DateTimeField(auto_now=True, db_column='purchase_at_plan')
    # Data da realização do pagamento
    payment_date = models.DateTimeField(null=True, blank=True, db_column='payment_date_plan')
    # -- Data do próximo pagamento
    next_due_date = models.DateField(null=True, blank=True, db_column='next_due_date_plan')
    status = models.ForeignKey(Plan_Status, on_delete=models.CASCADE, default=Plan_Status.get_default_pk, db_column='FK_plan_status')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='plans', db_column='FK_user_plan')
    plan_type = models.ForeignKey(Plan_Type, on_delete=models.SET_NULL, null=True, blank=True, db_column='FK_plan_type')
    is_free_trial = models.BooleanField(default=False, db_column='is_free_trial_plan')
    preferable_payment_day = models.PositiveIntegerField(null=True, blank=True, db_column='preferable_payment_day_plan')
    

    class Meta:
        db_table = 'Plan'
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'
        ordering = ['-purchase_at']

    def __str__(self):
        return f"{self.plan_type.plan_type} assinado por {self.user.name} - {self.status}" # type: ignore
    
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
    