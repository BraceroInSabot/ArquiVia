# Adicione estas importações no início do seu arquivo
from typing import Optional, Tuple, Type
from django.contrib.auth import get_user_model
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import Token

# É uma boa prática definir um alias para o seu modelo de usuário
User = get_user_model()


class CookiesJWTAuth(JWTAuthentication):
    """
    Custom Authentication that extracts the JWT token from an HttpOnly cookie
    instead of the Authorization header.
    """

    def authenticate(self, request: Request) -> Optional[Tuple[User, Token]]: # type: ignore
        """
        Tries to authenticate the user using the JWT token from the 'access_token' cookie.

        Args:
            request: requisition object from DRF.

        Returns:
            A tuple with (user, validated_token) on success,
            or None if authentication fails or is not applicable.
        """
        # request.COOKIES.get() pode retornar str ou None
        token_acesso: Optional[str] = request.COOKIES.get('access_token')

        if not token_acesso:
            return None
        
        # self.get_validated_token retorna uma instância de Token (ou levanta uma exceção)
        token_validado: Token = self.get_validated_token(token_acesso) # type: ignore

        try:
            # self.get_user retorna uma instância do seu modelo de usuário
            usuario: Type[User] = self.get_user(validated_token=token_validado) # type: ignore
        except Exception:
            # Se get_user falhar (ex: usuário deletado), a autenticação falha
            return None
        
        return (usuario, token_validado)