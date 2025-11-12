import os
from typing import Dict, List, Union, Any
from django.utils.text import slugify
from django.utils import timezone

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


def rename_file_for_s3(instance: Any, filename: str):
    """
    Renomeia o arquivo para um formato padrão sendo ele: nome ( ou titulo ) do objeto + Data atual incluindo segundos.
    
    Args:
        filename (str): Nome do arquivo com a extensão (.pdf, .png, etc).
        instance (Any): Qualquer que seja o tipo de instância.
    """
    ext = filename.split('.')[-1]
    
    if instance.title:
        filename_base = slugify(instance.title)
    else:
        filename_base = "arquivo_sem_titulo"

    current_time = timezone.now().strftime('%Y-%m-%d_%H-%M-%S')

    new_filename = f"{filename_base}_{current_time}.{ext}"
    
    return os.path.join('attached_documents/', new_filename)
