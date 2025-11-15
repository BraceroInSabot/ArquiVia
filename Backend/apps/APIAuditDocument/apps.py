from django.apps import AppConfig


class ApiauditdocumentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.APIAuditDocument'

    def ready(self):
        import apps.APIAuditDocument.signals