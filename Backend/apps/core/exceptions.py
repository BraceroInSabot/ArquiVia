# DRF
from django.http import HttpResponse
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

# NATIVE
from typing import Dict, Optional

# PROJECT
from .utils import default_response 

def custom_exception_handler(exc: Exception, context: dict) -> Optional[Response]:
    """
    Custom exception handler for DRF to standardize API error responses.

    This function intercepts exceptions handled by Django Rest Framework. It first
    calls the default DRF exception handler to get the basic error response 
    (including the correct status code and error details). It then reformats 
    that response into the project's standard error structure using the 
    `default_response` utility function.

    Args:
        exc (Exception): The exception instance that was raised.
        context (dict): A dictionary containing context data, such as the 
                        view and the request that triggered the exception.

    Returns:
        Optional[Response]: A DRF Response object with the custom error format 
                            if the exception is handled by DRF, otherwise None.
    """
    response = exception_handler(exc, context)
    
    if response is not None: 
        if isinstance(exc, ValidationError):
            response.data = default_response(
                success=False,
                message=list(response.data.values())[0][0], #type: ignore
            )
        else:
            if isinstance(response.data, dict) and 'detail' in response.data:
                msg = str(response.data['detail'])
            else:
                msg = str(response.data)
                
            response.data = default_response(success=False, message=msg)
        

    elif response is None and isinstance(exc, Exception):
        res: HttpResponse = Response()
        res.status_code = 500
        res.data = default_response(success=False, message="Houve um erro interno no servidor.")
        
        return res
        
    return response