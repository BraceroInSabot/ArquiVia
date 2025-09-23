from django.contrib.auth import get_user_model
from apps.APIDocumento.models import Classification, Classification_Privacity, Classification_Status, Document
from typing import Type
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Sector, SectorUser

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
                "reviewedBy": classification.reviewedBy.name, # type: ignore
                "privacity": classification.privacity.privacity, # type: ignore
                "privacity_abreviation": classification.privacity.priv_abreviation # type: ignore
            }
        except Classification.DoesNotExist:
            return {"messaage": "Classificação não encontrada."}
        except Exception as e:
            return {"message": "Erro ao carregar a classificação."}
        
class UpdateClasssificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        document_id = request.data.get('document_id', '')
        sector_id = request.data.get('sector_id', '')
        user = request.user
        
        reviewClassificationStatus = request.data.get('review_classification_status', None)
        classification_status_id = request.data.get('classification_status_id', None)
        privacity_id = request.data.get('privacity_id', None)
        
        try:
            Document.objects.get(doc_id=document_id)
        except Document.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "sucesso": False,
                "message": "Documento não encontrado."
            }
            return ret
        
        if (SectorUser.objects.filter(user=request.user, sector__sector_id=sector_id).exists() is False 
            and 
            Sector.objects.filter(manager=request.user).exists() is False):
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "sucesso": False,
                "message": "Você não tem permissão para editar a classificação deste documento."
            }
            return ret

        try:
            classification = Classification.objects.get(document_id=document_id)
            
            classification.reviewClassificationStatus=reviewClassificationStatus
            classification.classification_status=Classification_Status.objects.get(status_id=classification_status_id)
            classification.privacity=Classification_Privacity.objects.get(classification_privacity_id=privacity_id) # type: ignore
            classification.reviewedBy=user
            classification.document=Document.objects.get(doc_id=document_id)
            classification.save()
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "sucesso": False,
                "message": "Erro ao editar a classificação do documento."
            }
            return ret

        ret = Response()
        ret.status_code = 200
        ret.data = {
            "sucesso": True,
            "message": "Classificação do documento editada com sucesso."
        }
        return ret
        