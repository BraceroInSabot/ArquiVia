from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

class Admin(UserAdmin):
    model = get_user_model()

    list_display = ['username', 'email', 'nome', 'date_joined', 'last_login', 'is_active']
    search_fields = ['usuario', 'email', 'nome']

    ordering = ['username']

admin.site.register(get_user_model(), Admin)