from rest_framework.views import exception_handler as drf_exception_handler
from typing import Dict, List, Union

def default_response(success: bool, 
                     message: str = "",
                     data: Union[Dict[str, str], List[Dict[str, str] | str], bool] = False) -> Dict[str,
                                                                                              Union[bool,
                                                                                                    str,
                                                                                                    Dict[str, str],
                                                                                                    List[Dict[str, str] | str]
                                                                                                    ]
                                                                                              ]:
    """
    Defines a standard response dictionary.
    
    Args:
        success (bool): Indicates if the operation was successful.
        message (str): Message describing the result of the operation.
        data (Union[Dict[str, str], List[Dict[str, str]], bool], optional): Additional data to include in the response. Defaults to False.

    Returns:
        Dict[str, Union[bool, str, Dict[str, str], List[Dict[str, str]]]]: Standardized response dictionary.
    """
    
    if data:
        return {
            "sucesso": success,
            "mensagem": message,
            "data": [d for d in data] if isinstance(data, list) else data
        }
        
    return {
        "sucesso": success,
        "mensagem": message
    }
    


def custom_exception_handler(exc, context):
    """
    Manipulador de exceção customizado para o DRF que padroniza todas 
    as respostas de erro da API.
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        response.data = default_response(success=False, message=exc.detail)

    return response