from rest_framework_simplejwt.authentication import JWTAuthentication

class CookiesJWTAuth(JWTAuthentication):

    def authenticate(self, request):
        token_acesso = request.COOKIES.get('access_token')

        if not token_acesso:
            return None
        
        token_validado = self.get_validated_token(token_acesso)

        try:
            usuario = self.get_user(validated_token=token_validado)
        except:
            print('None1')
            return None
        
        return (usuario, token_validado)