from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django.views.decorators.csrf import csrf_protect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import RegistroUsuarioSerializer
from django.shortcuts import render
from apps.APISetor.models import Colaborador_Setor
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import Colaborador, PasswordResetToken
from django.template.loaders.cached import Loader
from uuid import uuid4
from rest_framework import status
from django.contrib.auth.hashers import make_password

# LOGIN

class LoginTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Obtém o Token do usuário a partir de autenticação do usuário em client-side. Armazena o token em Coookies.

        Args:
            request: metadados requisição realizada
        """

        response = super().post(request, *args, **kwargs)

        try:
            print(111112312312)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']
            res = Response()

            res.data = {"sucesso": "usuário autenticado com sucesso"}

            print("Começou")
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
                print(e)
            print('Terminou')
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='',
                path='/',
            )
            
            return res
        except Exception as e:
            print(e)
            return Response({"falha": "houve uma falha na autenticação do usuário."})

class LoginTokenRefreshPairView(TokenRefreshView):

    def post(self, request, *args, **kwargs):
        try:
            token_refresh = request.COOKIES.get('refresh_token')
            request.data['refresh'] = token_refresh

            res = super().post(request, *args, **kwargs)

            tokens = res.data
            token_acesso = tokens['access']

            res = Response()
            res.data = {"autenticacao": True}

            res.set_cookie(
                key='access_token',
                value=token_acesso,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            print('até aqui')

            return res
        except:
            return Response({"autenticacao": False})
        
# REGISTRO

class RegisterTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"Sucesso": True}, status=201)
        
        return Response((serializer.errors), status=400)

# LOGOUT

class LogoutTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            user = request.user
            user.last_login = timezone.now().astimezone(timezone.get_current_timezone())
            user.save()
        except:
            pass
        try:
            res = Response()
            res.data = {'Sucesso': 'Usuário deslogado com sucesso!'}
            res.delete_cookie('access_token', path='/', samesite='None')
            res.delete_cookie('refresh_token', path='/', samesite='None')
            return res
        except:
            return Response({'Falha': 'Não foi possível deslogar o usuário.'})

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
        email = request.data.get('emailUsuario')
        cEmail = request.data.get('emailGestor')
        
        try:
            usuario = Colaborador.objects.filter(email=email).first()
        except Colaborador.DoesNotExist:
            Response({"Falha": "Email do Usuário não encontrado."})

        try:
            gestor = Colaborador.objects.filter(email=cEmail).first()
        except Colaborador.DoesNotExist:
            Response({"Falha": "Email do Gestor (a) não encontrado."})

        try:
            token = PasswordResetToken.objects.create(colaborador=usuario, token=str(uuid4()))
            url = f"{settings.FRONTEND_URL}/refinir-senha/{token.token}"

            if self.enviar_email_recuperacao_senha(email, usuario, url=url, token=token):
                return Response({"Sucesso": "Email enviado com sucesso!"})
            else:
                return Response({"Falha": "Email não enviado"})
        
        except Colaborador_Setor.DoesNotExist:
            return Response({"Falha": "Email não encontrado."}, status=404)
        
        except Exception as e:
            print(e)
            return Response({"Falha": "Houve uma falha ao enviar o email."}, status=500)

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
        print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
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
        
