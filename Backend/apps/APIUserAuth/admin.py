from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin


class Admin(UserAdmin):
    model = get_user_model()

    list_display = [
        "username",
        "nome",
        "email",
        "date_joined",
        "last_login",
        "is_active",
    ]
    search_fields = ["usuario", "email", "nome"]

    ordering = ["username"]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Informações Pessoais", {"fields": ("nome", "email", "imagem")}),
        ("Permissões", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datas Importantes", {"fields": ("last_login", "date_joined", "horario_inicio_expediente", "horario_final_expediente")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "nome", "email", "password1", "password2"),
        }),
    )

admin.site.register(get_user_model(), Admin)
