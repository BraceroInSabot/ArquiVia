from django.contrib import admin
from .models import Setor, Colaborador_Setor

class ColaboradorSetorInline(admin.TabularInline):  # Ou admin.StackedInline para layout diferente
    model = Colaborador_Setor
    extra = 1  
    autocomplete_fields = ['codigoColaborador']

class SetorAdmin(admin.ModelAdmin):
    model = Setor

    list_display = [
        'nomeSetor',
        'codigoColaboradorGestor',
        'ativoSetor',
    ]

    search_fields = ["nomeSetor"]

    inlines = [ColaboradorSetorInline]

    ordering = ["nomeSetor"]


admin.site.register(Setor, SetorAdmin)
