from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Setor(models.Model):
    codigoSetor = models.SmallAutoField(primary_key=True, verbose_name='Codigo do Setor')
    nomeSetor = models.CharField(max_length=155, blank=False, null=False, default='Setor', verbose_name='Nome do Setor')
    imagemSetor = models.CharField(max_length=255, null=True, verbose_name='Imagem do Setor')
    codigoColaboradorGestor = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=False, default=0, verbose_name='Administrado por')
    ativoSetor = models.BooleanField(default=False, blank=False, null=False, verbose_name='Ativo')

    class Meta():
        db_table = 'Setor'
        verbose_name = 'Setor'
        verbose_name_plural = 'Setores'

class Colaborador_Setor(models.Model):
    codigoColaboradorSetor = models.SmallAutoField(primary_key=True, verbose_name='CodigoColaboradorSetor')
    codigoColaborador = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=False, default=0, unique=True, verbose_name='CodigoColaborador')
    codigoSetor = models.ForeignKey(Setor, on_delete=models.CASCADE, blank=False, null=False, default=0, verbose_name='CodigoSetor')
    administradorColaboradorSetor = models.BooleanField(default=False, blank=False, null=False, verbose_name='AdministradorSetor')

    class Meta():
        db_table = 'Colaborador_Setor'
        verbose_name = 'Ligação Colaborador com Setor'
        verbose_name_plural = 'Ligações Colaboradores com Setores'
    