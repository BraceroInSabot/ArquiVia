# DRF
from django.http import HttpResponse, Http404
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from django.conf import settings

# NATIVE
from typing import Dict, Optional

# PROJECT
from .utils import default_response 

def custom_exception_handler(exc: Exception, context: dict) -> Optional[Response]:
    """
    Handler de exceção robusto que padroniza todas as respostas de erro.
    """
    # Primeiro, chama o handler padrão do DRF para obter o status e os dados do erro.
    response = exception_handler(exc, context)

    if response is not None:
        
        # Verificamos se a resposta gerada pelo DRF é um 404
        if response.status_code == status.HTTP_404_NOT_FOUND:
            response.data = default_response(
                success=False, 
                message=_("Recurso não encontrado.")
            )
            
        # --- ESTE É O BLOCO CORRIGIDO ---
        # Lógica para erros de validação
        elif isinstance(exc, ValidationError):
            # Em vez de tentar adivinhar a mensagem, usamos uma mensagem genérica
            # e passamos o dicionário de erros COMPLETO para a chave 'data'.
            response.data = default_response(
                success=False,
                message=_("Dados inválidos. Por favor, verifique os erros."),
                data=response.data  # response.data aqui é o serializer.errors
            )
        # ----------------------------------
            
        # Lógica para outros erros de API (401, 403, etc.)
        else:
            if isinstance(response.data, dict) and 'detail' in response.data:
                msg = _(str(response.data['detail']))
            else:
                msg = _(str(response.data))
            response.data = default_response(success=False, message=msg)

    # Lógica para erros 500 inesperados (onde response era None)
    elif response is None and isinstance(exc, Exception):
        
        if settings.DEBUG:
            # Em modo DEBUG, é melhor ver o traceback completo
            return None 
        
        # Para todos os outros erros inesperados, mantemos o 500
        response = Response(
            default_response(success=False, message=_("Houve um erro interno no servidor.")),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
            
    return response