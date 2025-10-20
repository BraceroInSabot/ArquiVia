from django.db import models
from django.contrib.auth import get_user_model
from apps.APIEmpresa.models import Enterprise

User = get_user_model()

class Sector(models.Model):
    sector_id = models.AutoField(primary_key=True, db_column="PK_sector")
    name = models.CharField(null=False, max_length=200, db_column="name_sector")
    image = models.CharField(max_length=50, db_column="image_sector", null=True, blank=True)
    creation_date = models.DateTimeField(auto_now_add=True, db_column='date_created_at_sector')
    manager = models.ForeignKey(User, on_delete=models.CASCADE, db_column='FK_manager_sector', related_name="managers")
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, db_column='FK_enterprise_sector', related_name="enterprises")
    is_active = models.BooleanField(default=True, db_column="is_active_sector")
    
    class Meta:
        db_table = "Sector"
        
        verbose_name = "Setor"
        verbose_name_plural = "Setores"
        
    def __str__(self):
        return self.name

class SectorUser(models.Model):
    sector_user_id = models.BigAutoField(primary_key=True, db_column="ID_sector_user")
    is_adm = models.BooleanField(default=False, db_column="is_administrator_sector_user")
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, db_column="FK_sector_sector_user", related_name="sector_links")
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="FK_user_sector_user", related_name="user_links")
    
    class Meta:
        db_table = "SectorUser"
        
        verbose_name = "Vinculo entre Setor e Usuario"
        verbose_name_plural = "Vinculos entre Setores e Usuarios"
        
    def __str__(self):
        return f"{self.user} vinculado ao setor {self.sector}"

# class KeyCodeSector(models.Model):
#     key_code_id = models.AutoField(primary_key=True, db_column="ID_key_code")
#     key = models.CharField(max_length=256, db_column="key")
#     expiration = models.DateTimeField(default=lambda: timezone.now() + timedelta(hours=3), db_column="expiration_date")
#     sector = models.ForeignKey(Sector, on_delete=models.CASCADE, db_column="PK_sector")
    
#     class Meta:
#         db_table = "KeyCodeSector"
        
#         verbose_name = "Codigo Chave"
#         verbose_name_plural = "Códigos Chave"