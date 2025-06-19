from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django.views.decorators.csrf import csrf_protect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import RegistroUsuarioSerializer
from django.shortcuts import render
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import AbsUser, PasswordResetToken
from django.template.loaders.cached import Loader
from uuid import uuid4
from rest_framework import status
from django.contrib.auth.hashers import make_password

# Typing
from django.http import HttpResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request: dict, *args, **kwargs) -> HttpResponse:
        """Obtém o Token do usuário a partir de autenticação do usuário em client-side. Armazena o token em Coookies.

        Args:
            request: requisição realizada
        """

        response: HttpResponse = super().post(request, *args, **kwargs)

        try:
            tokens: dict = response.data

            access_token: str = tokens['access']
            refresh_token: str = tokens['refresh']
            res: HttpResponse = Response()

            try:
                res.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=True,
                    samesite='',
                    path='/',
                )
            except Exception as e:
                res.status_code=400
                res.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Houve erros internos, contate o suporte!"
                    }}
                
                return res
            
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='',
                path='/',
            )
            
            res.data = {"Data": 
            { 
                "sucesso": True,
                "mensagem": "Usuário autenticado com sucesso"
            }}

            res.status_code=200
            return res
        
        except Exception as e:
            res.status_code=400
            res.data = {"Data": 
                    { 
                        "sucesso": False,
                        "mensagem": "Houve erros internos ao, contate o suporte!"
                }}   
            return

class LoginTokenRefreshPairView(TokenRefreshView):

    def post(self, request: dict, *args, **kwargs) -> HttpResponse:
        """
        Faz a revitalização do Token, quando possível.

        Args:
            request: requisição realizada
        """

        try:
            try:
                token_refresh: str = request.COOKIES.get('refresh_token')
                request.data['refresh'] = token_refresh

                res: HttpResponse = super().post(request, *args, **kwargs)

                tokens: dict = res.data
                token_access: str = tokens['access']
            except:
                return Response({"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Erro ao consumir o Token. Tente novamente."
                    }})
            
            res: HttpResponse = Response()

            res.set_cookie(
                key='access_token',
                value=token_access,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.data = {"Data": 
                        { 
                            "sucesso": True,
                            "mensagem": "Token revitalizado!"
                    }}

            return res
        except:
            response = Response(status=400)
            response.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Houve erros internos, contate o suporte!"
                    }}   
            return response

class RegisterTokenView(APIView):
    permission_classes: AllowAny = [AllowAny]

    def post(self, request: dict) -> HttpResponse:
        """
        Realiza a criação de um novo usuário para o sistema.

        Args:
            request: requisição realizada
        """
        serializer: object = RegistroUsuarioSerializer(data=request.data)

        if serializer.is_valid():                
            serializer.save()

            response: HttpResponse = Response(status=200)
            response.data = {"Data": 
                        { 
                            "sucesso": True,
                            "mensagem": "Usuário criado com sucesso!"
                    }}
            
            return response

        
        return Response((serializer.errors), status=400)

class LogoutTokenView(APIView):
    permission_classes: AllowAny = [AllowAny]

    def post(self, request: dict) -> HttpResponse:
        """
        Realiza a remoção dos tokens de acessos.

        Args:
            request: requisição realizada.
        """
        try:
            user: User = request.user # type: ignore
            user.last_login  = timezone.now().astimezone(timezone.get_current_timezone())
            user.save()
        except:
            response: HttpResponse = Response(status=400)
            response.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Erro ao processar data de saída."
                    }}    
            return response
        
        try:
            res: HttpResponse = Response(status=200)
            res.data = {"Data": 
                        { 
                            "sucesso": True,
                            "mensagem": "Logoff realizado!"
                    }}
            res.delete_cookie('access_token', path='/', samesite='None')
            res.delete_cookie('refresh_token', path='/', samesite='None')
            return res
        except:
            response: HttpResponse = Response(status=400)
            response.data = {"Data": 
                        { 
                            "sucesso": False,
                            "mensagem": "Erro ao deslogar usuário."
                    }}   
            return response

# RESET DE SENHA

class RequisicaoRedefinicaoSenhaView(APIView):
    permission_classes = [AllowAny]

    def enviar_email_recuperacao_senha(self, destinatario, usuario, url=None, token="ERRO AO GERAR O TOKEN, ENTRE EM CONTATO COM O PROVEDOR."):
        try:
            assunto = "Esqueci minha senha - AnnotaPS"
            remetente = settings.EMAIL_HOST_USER
            
            # Renderiza o template com os dados
            html_content = render_to_string([
                "email_esqueci_senha.html"
                ], 
                {
                "nome": usuario.nome,
                "url": str(url),  # Substitua pela URL de redefinição real
                "token": token
                },
            )
            text_content = strip_tags(html_content)  # Remove HTML para fallback
            
            email = EmailMultiAlternatives(
                subject=assunto,
                body=text_content,  # Conteúdo sem HTML
                from_email=remetente,
                to=[destinatario]
            )
            email.attach_alternative(html_content, "text/html")  # Adiciona versão HTML
            email.send()
            return True
        except Exception as e:
            print(f"Erro ao enviar e-mail: {e}")
            return False

    def post(self, request):
        """Além de ser utilizado na tela de autenticação, também é utilizado na tela de gestão de setor pelo Gestor.

        Args:
            request (HTTPrequest): requisição feita pelo host.

        Returns:
            Response (200 || 401): Resposta da requisição
        """
        email = request.data.get('emailUsuario')
        cEmail = request.data.get('emailGestor')
        
        usuario = Colaborador.objects.filter(email=email).first()
        if usuario == None:
            return Response(data={"Falha": [False, "Email do Usuário não encontrado. Verifique o seu e-mail."]}, status=200)

        gestor = Colaborador.objects.filter(email=cEmail).first()
        if gestor == None:
            return Response(data={"Falha": [False, "Email do Gestor (a) não encontrado."]}, status=401)

        try:
            token = PasswordResetToken.objects.create(colaborador=usuario, token=str(uuid4()))
            url = f"{settings.FRONTEND_URL}/redefinir-senha/{token.token}"

            if self.enviar_email_recuperacao_senha(email, usuario, url=url, token=token):
                return Response(data={"Sucesso": [True, "Email enviado com sucesso!"]}, status=200)
            else:
                return Response(data={"Falha": "Email não enviado"}, status=401)
        
        except Colaborador_Setor.DoesNotExist:
            return Response(data={"Falha": "Email não encontrado."}, status=404)
        
        except Exception as e:
            return Response(data={"Falha": "Houve uma falha ao enviar o email."}, status=500)

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

        reset_token = PasswordResetToken.objects.filter(token=token).first()

        if not reset_token or not reset_token.is_token_valid():
            return Response({"Alerta": "Token inválido ou expirado"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"Alerta": "Token válido"}, status=status.HTTP_200_OK)
    
class RedefinirSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get("token")
        nova_senha = request.data.get("password")

        token_validacao = PasswordResetToken.objects.filter(token=token).first()
        if not token_validacao or not token_validacao.is_token_valid():
            print(token_validacao, token_validacao.is_token_valid())
            return Response({"message": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            usuario = token_validacao.colaborador
            usuario.password = make_password(nova_senha)
            usuario.save()

            return Response({"Alerta": "Senha redefinida!"})
        except:
            return Response({"Alerta": "Não foi possível salvar a nova senha."})
        
