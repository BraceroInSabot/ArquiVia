from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from apps.APISetor.models import Sector, SectorUser
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
            if (SectorUser.objects.filter(user=request.user, sector__sector_id=sector_id).exists() is False 
            and 
            Sector.objects.filter(manager=request.user).exists() is False):
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Usuário não pertence ao setor."
                    }
                }
                return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Erro ao verificar associação do usuário ao setor: {str(e)}"
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
    
class ListDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sector_id = request.data.get('sector_id', '')
        
        if Sector.objects.filter(sector_id=sector_id).exists() is False:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Setor não encontrado."
                }
            }
            return ret
        
        documents = Document.objects.filter(creator=request.user, sector__sector_id=sector_id)
        
        if not (SectorUser.objects.filter(user=request.user, sector__sector_id=sector_id).exists() 
            or 
            Sector.objects.filter(manager=request.user, sector_id=sector_id).exists()):
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Usuário não pertence ao setor."
                }
            }
            return ret
            
        document_list = [
            {
                "document_id": doc.doc_id,
                "title": doc.title,
                "context_beta": doc.context_beta,
                "created_at": doc.data_criacao,
                "sector_id": doc.sector.sector_id,
                "sector_name": doc.sector.name
            }
            for doc in documents
        ]
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": document_list
            }
        }
        return ret
    
class ShowDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        document_id = request.data.get('document_id', '')
        
        if type(document_id) != int:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "ID inválido."
                }
            }
            return ret
        
        try:
            document = Document.objects.get(doc_id=document_id)
        except Document.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Documento não encontrado."
                }
            }
            return ret
        
        if not (SectorUser.objects.filter(user=request.user, sector=document.sector).exists() 
            or 
            Sector.objects.filter(manager=request.user, sector_id=document.sector.sector_id).exists()):
            ret = Response()
            ret.status_code = 403
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Você não tem permissão para completar essa ação."
                }
            }
            return ret
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": {
                    "document_id": document.doc_id,
                    "title": document.title,
                    "context_beta": document.context_beta,
                    "created_at": document.data_criacao,
                    "sector_id": document.sector.sector_id,
                    "sector_name": document.sector.name
                }
            }
        }
        return ret
    
class UpdateDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        document_id = request.data.get('document_id', '')
        new_title = request.data.get('title', '')
        new_context_beta = request.data.get('context_beta', '')
        
        if type(document_id) != int:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "ID inválido."
                }
            }
            return ret

        try:
            document = Document.objects.get(doc_id=document_id)
        except Document.DoesNotExist:
            ret = Response()
            ret.status_code = 404
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Documento não encontrado."
                }
            }
            return ret
        
        try:
            if not (SectorUser.objects.filter(user=request.user, sector=document.sector).exists() 
                or 
                Sector.objects.filter(manager=request.user, sector_id=document.sector.sector_id).exists()):
                ret = Response()
                ret.status_code = 403
                ret.data = {
                    "Data": {
                        "sucesso": False,
                        "mensagem": "Você não tem permissão para completar essa ação."
                    }
                }
                return ret
        except Exception as e:
            ret = Response()
            ret.status_code = 500
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": f"Erro ao verificar permissão do usuário: {str(e)}"
                }
            }
            return ret
        
        if len(new_title) < 3 or len(new_title) > 200:
            ret = Response()
            ret.status_code = 400
            ret.data = {
                "Data": {
                    "sucesso": False,
                    "mensagem": "Título deve ter entre 3 e 200 caracteres."
                }
            }
            return ret
            
        document.title = new_title
        document.context_beta = new_context_beta
        document.save()
        
        ret = Response()
        ret.status_code = 200
        ret.data = {
            "Data": {
                "sucesso": True,
                "mensagem": "Documento atualizado com sucesso."
            }
        }
        return ret