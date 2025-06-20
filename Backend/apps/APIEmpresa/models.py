from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Enterprise(models.Model):
    ent_id = models.AutoField(primary_key=True, db_column='ID_enterprise')
    name = models.CharField(null=False, max_length=100, db_column='enterprise_name')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, db_column='PK_owner')
    image = models.CharField(max_length=50, db_column="enterprise_image")
    created_at = models.DateTimeField(auto_now_add=True, db_column='date_creation')
    is_active = models.BooleanField(default=True, db_column='is_active')

    class Meta:
        db_table = "Enterprise"

        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"

    def __str__(self):
        return self.name
    