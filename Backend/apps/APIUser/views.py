from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Colaborador_Setor, Setor
from apps.APIUserAuth.models import Colaborador
from django.utils.formats import date_format
from django.utils import timezone
from .utils.dump import dumpTokens
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from apps.APIUserAuth.utils.validacoes import ValidacaoAutenticacao

class EstaAutenticadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"sucesso": "Usuário autenticado."}, status=200)
    
class UsuarioInformacoesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            colaborador_setor = Colaborador_Setor.objects.get(codigoColaborador=request.user)
            setor_usuario = colaborador_setor.codigoSetor.nomeSetor
        except Colaborador_Setor.DoesNotExist:
            setor_usuario = None

        def formatar_data(data):
            """Converte para o fuso correto antes de formatar."""
            if data is None:
                return None
            
            # print(settings.TIME_ZONE)  
            # print(timezone.get_current_timezone())  
            print( timezone.localtime(data))
            data_local = timezone.localtime(data)  # Converte UTC -> America/Sao_Paulo
            print(date_format(timezone.localtime(data), "d \d\e F, Y. H\hi."))
            return date_format(data_local, "d \d\e F, Y. H\hi .")

        inicio_expediente = request.user.horario_inicio_expediente
        final_expediente = request.user.horario_final_expediente

        infos = {
            "nome": request.user.nome,
            "email": request.user.email,
            "setor": setor_usuario,
            "data_criacao": formatar_data(request.user.date_joined),
            "ultimo_login": formatar_data(request.user.last_login),
            "inicio_expediente": formatar_data(inicio_expediente) if inicio_expediente else None,
            "final_expediente": formatar_data(final_expediente) if final_expediente else None,
        }

        return Response({"usuario": [infos]}, status=200)

class DesativarUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password', '')

        if not user.check_password(password):
            return Response({"error": "Senha incorreta."}, status=400)

        user.is_active = False
        user.save()

        return dumpTokens()
        
class AlterarSetorUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        ccSetor1 = request.data.get("codigoChaveAtual")
        ccSetor2 = request.data.get("codigoChaveAlvo")
        res = Response()

        try:
            setorUsuario = Colaborador_Setor.objects.filter(codigoColaborador=user).first()
        except Colaborador_Setor.DoesNotExist:
            res.data = {"O setor do usuário não foi encontrado."}
            res.status_code = 400
            return res

        print(setorUsuario.codigoSetor.codigoChave, ccSetor1)
        if (setorUsuario.codigoSetor.codigoChave != ccSetor1): 
            res.data = {"Setor não correspondente."}
            res.status_code = 400
            return res

        try:
            setorAlvo = Setor.objects.filter(codigoChave=ccSetor2).first()
        except Setor.DoesNotExist:
            res.data = {"Setor alvo não encontrado."}
            res.status_code = 400
            return res
        
        setorUsuario.codigoSetor = setorAlvo
        setorUsuario.save()
        
        return dumpTokens()

class AlterarSenhaUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        senhaAtual = request.data['password']
        senhaNova = request.data['nPassword']

        try:
            senhaUsuario = authenticate(username=user.username, password=senhaAtual)

            if not senhaUsuario:
                res = Response()
                res.data = {"Alerta": "Senha atual incorreta"}
                res.status_code = 400
                return res
        except Colaborador.DoesNotExist:
            res = Response()
            res.data = {"Alerta": "Senha atual incorreta"}
            res.status_code = 400
            return res
        
        try:
            if not ValidacaoAutenticacao(senha=senhaNova).validar_senha():
                res = Response()
                res.data = {"Alerta": "A nova senha não é permitida."}
                res.status_code = 400
                return res
        except:
            res = Response(
                data={"Alerta": "Houve um erro inesperado."}, 
                status_code=400)
            return res


        user.password = make_password(senhaNova)
        user.save()

        res = Response(
            data={"Alerta": "Alteração de senha completa com sucesso!"}, 
            status=200)
        return res

class AlterarDadosUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        nome = request.data['nome']
        email = request.data['email']

        if user.nome != nome:
            user.nome = nome
            user.save()
        
        if user.email != email:
            user.email = email
            user.save()
        
        return Response(data={"Alerta": "Dados alterados."}, status=200)
