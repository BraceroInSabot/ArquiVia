from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()



class Codigo_Chave_Setor(models.Model):
    codigoChave = models.AutoField(primary_key=True, db_column='CodigoChave', verbose_name='Código Chave')
    chave = models.CharField(max_length=6, null=True, unique=True, db_column='CodigoChaveSetor', verbose_name='Código Chave')
    tempoExpirar = models.DateTimeField(blank=True, null=True, db_column='TempoExpiracao', verbose_name='Tempo até expirar')

    class Meta():
        db_table = 'Codigo_Chave_Setor'
        verbose_name = 'Código Chave do Setor'
        verbose_name_plural = 'Código Chave de Setores'

class Setor(models.Model):
    codigoSetor = models.SmallAutoField(primary_key=True, db_column='CodigoSetor', verbose_name='Codigo do Setor')
    nomeSetor = models.CharField(max_length=155, blank=False, null=False, default='Setor', db_column='NomeSetor', verbose_name='Nome do Setor')
    imagemSetor = models.CharField(max_length=255, null=True, db_column='ImagemSetor', verbose_name='Imagem do Setor')
    codigoChave = models.ForeignKey(Codigo_Chave_Setor, on_delete=models.CASCADE, null=True, db_column='CodigoChave', verbose_name='Código Chave')
    codigoColaboradorGestor = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=False, default=0, db_column='CodigoColaboradorGestorSetor', verbose_name='Administrado por')
    ativoSetor = models.BooleanField(default=False, blank=False, null=False, db_column='AtivoSetor', verbose_name='Ativo')

    class Meta():
        db_table = 'Setor'
        verbose_name = 'Setor'
        verbose_name_plural = 'Setores'

class Colaborador_Setor(models.Model):
    codigoColaboradorSetor = models.SmallAutoField(primary_key=True, db_column='CodigoColaboradorSetor', verbose_name='Codigo Único')
    codigoColaborador = models.ForeignKey(User, on_delete=models.CASCADE, blank=False, null=False, default=0, unique=True, db_column='CodigoColaborador', verbose_name='Colaborador')
    codigoSetor = models.ForeignKey(Setor, on_delete=models.CASCADE, blank=False, null=False, default=0, db_column='CodigoSetor', verbose_name='Setor')
    administradorColaboradorSetor = models.BooleanField(default=False, blank=False, null=False, db_column='AdministradorColaboradorSetor', verbose_name='Administrador')

    class Meta():
        db_table = 'Colaborador_Setor'
        verbose_name = 'Ligação Colaborador com Setor'
        verbose_name_plural = 'Ligações Colaboradores com Setores'
    