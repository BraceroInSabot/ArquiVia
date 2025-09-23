from django.contrib.auth import get_user_model
from apps.APIDocumento.models import Document
from apps.APIDocumento.models import Classification, Classification_Privacity
from typing import Type

User = get_user_model()

class ClassificationViewUtil():
    
    def __init__(self, document_req: Document, user_req: Type[User]): # type: ignore
        self.document_req = document_req
        self.user_req = user_req
            
    def create_classification(self):
        """
        Cria uma classificação para o documento.
        """
        
        try:
            classification = Classification.objects.create(
                reviewClassificationStatus=False,
                reviewedBy=self.user_req,
                document=self.document_req,
                privacity=Classification_Privacity.objects.get(priv_abreviation='PV')
            )
        except (Exception) as e:
            print(e)
            return False
        
    def get_classification_by_ID(self, document_id: int) -> dict:
        """
        Retorna a classificação de um documento pelo seu ID.
        """
        
        try:
            classification = Classification.objects.get(document__doc_id=document_id)
            return {
                "classification_id": classification.classification_id,
                "reviewClassificationStatus": classification.reviewClassificationStatus,
                "classification_status": classification.classification_status.status,
                "reviewedBy": classification.reviewedBy.name,
                "privacity": classification.privacity.privacity,
                "privacity_abreviation": classification.privacity.priv_abreviation
            }
        except Classification.DoesNotExist:
            return {"messaage": "Classificação não encontrada."}
        except Exception as e:
            return {"message": "Erro ao carregar a classificação."}