from django.apps import AppConfig


class ApiauditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.APIAudit'

    def ready(self):
        import apps.APIAudit.signals