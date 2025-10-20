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
        
        Querys:
        
        INSERT INTO public."Classification_Privacity" ("ID_class_priv", privacity, abreviation) VALUES
            (1, 'Público', 'PB'),
            (2, 'Privado', 'PV');
            
        INSERT INTO public."Classification_Status" ("ID_status", status) VALUES
            (1, 'Concluído'),
            (2, 'Em Andamento'),
            (3, 'Revisão necessária'),
            (4, 'Arquivado');
        """
        from .models import Classification_Privacity, Classification_Status

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
        classification_status_data = [
            {'status_id': '1', 'status': 'Concluído'},
            {'status_id': '2', 'status': 'Em andamento'},
            {'status_id': '3', 'status': 'Revisão necessária'},
            {'status_id': '4', 'status': 'Arquivado'},
        ]
        
        insert_initial_data(classification_privacity_data, Classification_Privacity)
        insert_initial_data(classification_status_data, Classification_Status)
        
        
