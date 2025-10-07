from typing import Dict, List, Union

def default_response(success: bool, 
                     message: str,
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