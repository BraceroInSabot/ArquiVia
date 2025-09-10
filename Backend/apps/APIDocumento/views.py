from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.APISetor.models import Sector
from apps.APIDocumento.models import Document
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class CreateDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        title = request.data.get('title')
        context_beta = request.data.get('context_beta')
        sector_id = request.data.get('sector_id')

        try:
            sector = Sector.objects.get(sector_id=sector_id)
            
        except Sector.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Setor não encontrado."
                }
            }
            return ret

        try:
            document = Document.objects.create(
                title=title,
                context_beta=context_beta,
                creator=request.user,
                sector=sector
            )
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Erro ao criar documento: {str(e)}"
                }
            }
            return ret
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Documento criado com sucesso.",
            }
        }
        return ret