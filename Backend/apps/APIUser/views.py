from typing import Dict
from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django.views.decorators.csrf import csrf_protect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.APIEmpresa.models import Enterprise
from .serializer import ChangePasswordSerializer, RegistroUsuarioSerializer, UserDetailSerializer, UserEditSerializer
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import AbsUser, PasswordResetToken
from django.template.loaders.cached import Loader
from uuid import uuid4
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth import update_session_auth_hash

from django.db.models import Q

# DJANGO
from apps.core.utils import default_response

# Typing
from django.http import HttpResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request: dict, *args, **kwargs) -> HttpResponse:
        """
        Obtains the user's Token from user authentication in client-side. Stores the token in Cookies.

        Args:
            request: user request
        
        Returns:
            HttpResponse: Response to the request
        """
        response = super().post(request, *args, **kwargs) # type: ignore

        if response.status_code == 200: 
            tokens = response.data
            response.set_cookie(
                key='access_token', value=tokens['access'], # type: ignore
                httponly=True, secure=True, samesite='None'
            )
            response.set_cookie(
                key='refresh_token', value=tokens['refresh'], # type: ignore
                httponly=True, secure=True, samesite='None'
            )
            
            response.data = default_response(success=True, message="Usuário autenticado com sucesso!")

        return response

        
class LoginTokenRefreshPairView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request: dict, *args, **kwargs) -> HttpResponse:
        """
        Does the token refresh for the user, generating a new access token.

        Args:
            request: user request
            
        Returns:
            HttpResponse: Response to the request
        """

        try:
            try:
                token_refresh: str = request.COOKIES.get('refresh_token') # type: ignore
                request.data['refresh'] = token_refresh # type: ignore
                
                res: HttpResponse = super().post(request, *args, **kwargs) # type: ignore

                tokens: dict = res.data # type: ignore
                token_access: str = tokens['access']
            except:
                res: HttpResponse = Response()
                res.status_code=400
                res.data = default_response(success=False, message="Token de renovação inválido ou expirado, faça login novamente!")
            
            res: HttpResponse = Response()

            res.set_cookie(
                key='access_token',
                value=token_access,
                httponly=True,
                secure=True,
                samesite='Lax',
                path='/'
            )

            res.data = default_response(success=True, message="Token renovado com sucesso!")

            return res
        except:
            response = Response(status=500)
            response.data = default_response(success=False, message="Houve erros internos na aplicação.")
            return response

class RegisterTokenView(APIView):
    permission_classes: AllowAny = [AllowAny] #type: ignore
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request: dict) -> HttpResponse:
        """
        Create a new user in the system.

        Args:
            request: user request
        
        Returns:
            HttpResponse: Response to the request
        """
        serializer = RegistroUsuarioSerializer(data=request.data) # type: ignore

        if serializer.is_valid():                
            serializer.save()

            response: HttpResponse = Response(status=200)
            response.data = default_response(success=True, message="Usuário cadastrado com sucesso!")
            
            return response

        return Response(default_response(success=False, message="Não foi possível cadastrar o seu usuário.", data=[err for err in serializer.errors.values()][0]), status=400) #type: ignore

class LogoutTokenView(APIView):
    permission_classes: AllowAny = [AllowAny] # type: ignore

    def post(self, request: dict) -> HttpResponse:
        """
        Logs out the user by deleting the access and refresh tokens from cookies.
        
        Args:
            request (dict): The user request.
        
        Returns:
            HttpResponse: Response to the request.
        """
        try:
            user: User = request.user # type: ignore
            user.last_login  = timezone.now().astimezone(timezone.get_current_timezone())
            user.save()
        except (User.DoesNotExist, NotImplementedError):
            response: HttpResponse = Response(status=403)
            response.data = default_response(success=False, message="Usuário não encontrado.")  
            return response
        except:
            response: HttpResponse = Response(status=400)
            response.data = default_response(success=False, message="Erro ao registrar data de saída do usuário.")  
            return response
        
        try:
            res: HttpResponse = Response(status=200)
            res.data = default_response(success=True, message="Usuário deslogado com sucesso!")
            res.delete_cookie('access_token', path='/', samesite='Lax') # type: ignore
            res.delete_cookie('refresh_token', path='/', samesite='Lax') # type: ignore
            return res
        except:
            response: HttpResponse = Response(status=400)
            response.data = default_response(success=False, message="Erro ao deslogar usuário.")
            return response

class RetrieveUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request: dict, username: str):
        request_user = request.user # type:ignore
        
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            res: HttpResponse = Response()
            res.status_code = 404
            res.data = default_response(success=False, message="Usuário não encontrado.")
            return res
        
        if target_user == request_user:
            is_linked = True
        else:
            request_user_enterprise_ids = Enterprise.objects.filter(
                Q(owner=request_user) |
                Q(enterprises__manager=request_user) |
                Q(enterprises__sector_links__user=request_user)
            ).values_list('pk', flat=True).distinct()
            
            is_linked = Enterprise.objects.filter(
                pk__in=request_user_enterprise_ids
            ).filter(
                Q(owner=target_user) |
                Q(enterprises__manager=target_user) |
                Q(enterprises__sector_links__user=target_user)
            ).exists()
        
        if not is_linked:
            res: HttpResponse = Response()
            res.status_code = 403
            res.data = default_response(success=False, message="Você não tem permissão para visualizar este usuário.")
            return res

        serializer = UserDetailSerializer(target_user)
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res

class EditUserView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, username):
        user = get_object_or_404(User, username=username)
        
        serializer = UserEditSerializer(
            instance=user, 
            data=request.data, 
            partial=True 
        )
        
        serializer.is_valid(raise_exception=True)
        
        updated_user = serializer.save()
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, data=serializer.data)
        return res

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request) -> HttpResponse:
        """
        Processa a troca de senha.
        """
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        serializer.is_valid(raise_exception=True)

        user = request.user
        new_password = serializer.validated_data['new_password'] # type: ignore
        print(new_password)
        user.set_password(new_password)
        user.save()

        update_session_auth_hash(request, user)

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(
            success=True,
            message="Senha alterada com sucesso.",
        )
        return res
    
class DeactivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        password = request.data.get('password')
        
        if not user.check_password(password):
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Senha incorreta.")
            return res
        
        user.is_active = False
        user.save()

        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Usuário desativado com sucesso.")
        return res


# Password Token

class RequisicaoRedefinicaoSenhaView(APIView):
    permission_classes = [AllowAny]

    def enviar_email_recuperacao_senha(self, destinatario, usuario, url, token="ERRO AO GERAR O TOKEN, ENTRE EM CONTATO COM O PROVEDOR."):
        try:
            assunto = "Esqueci minha senha - ArquiVia"
            remetente = settings.EMAIL_HOST_USER
            
            html_content = render_to_string([
                "email_esqueci_senha.html"
                ], 
                {
                "nome": usuario.name,
                "url": str(url),
                "token": token
                },
            )
            text_content = strip_tags(html_content)
            
            email = EmailMultiAlternatives(
                subject=assunto,
                body=text_content,
                from_email=remetente,
                to=[destinatario]
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
            return True
        except Exception as e:
            print(e)
            return False

    def post(self, request):
        """Além de ser utilizado na tela de autenticação, também é utilizado na tela de gestão de setor pelo Gestor.

        Args:
            request (HTTPrequest): requisição feita pelo host.

        Returns:
            Response (200 || 401): Resposta da requisição
        """
        email = request.data.get('email')
        
        user_object = get_object_or_404(User, email=email)
        
        token = PasswordResetToken.objects.create(user=user_object, token=str(uuid4()))
        url = f"{settings.FRONTEND_URL}/redefinir-senha/{token.token}"

        if self.enviar_email_recuperacao_senha(email, user_object, url=url, token=token.token):
            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(success=True, message="Email enviado com sucesso. Olhe a sua caixa de entrada.")
            return res
        else:
            res: HttpResponse = Response()
            res.status_code = 500
            res.data = default_response(success=False, message="Houve um erro ao enviar o email.")
            return res
    
class ValidarTokenRedefinicaoValidoView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        """Verificação de validade do Token gerado

        Args:
            token (str): token gerado pelo usuário

        Returns:
            HTTP 200: Token válido
            HTTP 400: Token inválido ou expirado 
        """

        reset_token = get_object_or_404(PasswordResetToken, token=token)

        if not reset_token or not reset_token.is_token_valid():
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Token inválido ou expirado.")
            return res
        
        res: HttpResponse = Response()
        res.status_code = 200
        res.data = default_response(success=True, message="Token válido.")
        return res
    
class RedefinirSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token: str):
        new_password = request.data.get("password")

        token_validation = get_object_or_404(PasswordResetToken, token=token)
        
        if not token_validation or not token_validation.is_token_valid():
            res: HttpResponse = Response()
            res.status_code = 400
            res.data = default_response(success=False, message="Token inválido ou expirado.")
            return res
        
        try:
            user = token_validation.user
            user.password = make_password(new_password)
            user.save()

            res: HttpResponse = Response()
            res.status_code = 200
            res.data = default_response(success=True, message="Senha redefinida com sucesso.")
            return res
        except:
            res: HttpResponse = Response()
            res.status_code = 500
            res.data = default_response(success=False, message="Houve um erro ao redefinir a senha.")
            return res
