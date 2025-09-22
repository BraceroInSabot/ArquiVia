from django.apps import AppConfig
from django.db.models import Model
from typing import Type, Any, List, Dict
from django.db.utils import OperationalError

class ApidocumentoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.APIDocumento'
    
    def ready(self):
        """
        Este método é executado quando a aplicação está pronta.
        """
        from .models import models, Classification_Privacity

        def insert_initial_data(insert_data: List[Dict[str, Any]], model_class: Type[Model]):
            """
            Insere dados iniciais na tabela Classification_Privacity se ela estiver vazia.
            """
            try:            
                if not model_class.objects.exists():
                    model_class.objects.bulk_create(
                        [model_class(**data) for data in insert_data]
                )
            except OperationalError:
                pass
        
        classification_privacity_data = [
            {'classification_privacity_id': '1', 'privacity': 'Público', 'priv_abreviation': 'PB'},
            {'classification_privacity_id': '2', 'privacity': 'Privado', 'priv_abreviation': 'PV'},
        ]
        
        insert_initial_data(classification_privacity_data, Classification_Privacity)
        
        
