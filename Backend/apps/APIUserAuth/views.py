from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import RegistroUsuarioSerializer
from django.shortcuts import render

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

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        except:
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
            res.data = {"Atualização": "Autenticação renovada com sucesso"}

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
            return Response({"Atualização: Renovação não completa."})
        

class RegisterTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

class LogoutTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            res = Response()
            res.data = {'Sucesso': 'Usuário deslogado com sucesso!'}
            res.delete_cookie('access_token', path='/', samesite='None')
            res.delete_cookie('refresh_token', path='/', samesite='None')
            return res
        except:
            return Response({'Falha': 'Não foi possível deslogar o usuário.'})
