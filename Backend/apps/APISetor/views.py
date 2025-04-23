from django.shortcuts import render
from django.views.generic import ListView
from .models import Setor, Colaborador_Setor, Codigo_Chave_Setor
from apps.APIUserAuth.models import Colaborador

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .utils.verificar_autoridade import is_Gestor
from datetime import time
from random import randint, choices
from string import ascii_lowercase

class SetorADM(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        res = is_Gestor(user)
        

        return Response(data={"data": res}, status=200)
        

class SetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        setorINFO = {}
        colaboradoresINFO = {}
        user = request.user

        setor = Setor.objects.filter(colaborador_setor__codigoColaborador=user).first()
        colaboradores = Colaborador_Setor.objects.filter(codigoSetor=setor)

        colaboradores_ativos = colaboradores.filter(codigoColaborador__is_active=True).count()

        setorINFO['name'] = setor.nomeSetor
        setorINFO['leader'] = setor.codigoColaboradorGestor.nome
        setorINFO['leaderEmail'] = setor.codigoColaboradorGestor.email
        setorINFO['codigoChave'] = setor.codigoChave.chave
        setorINFO['image'] = setor.imagemSetor
        setorINFO['stats'] = {
            "ColaboradoresAtivos": colaboradores_ativos,
        }

        # Lista de colaboradores
        lista_colaboradores = []
        for item in colaboradores:
            colaborador = item.codigoColaborador

            if colaborador.horario_inicio_expediente is None:
                initH = 0
                initM = 0
            
            print(colaborador.horario_inicio_expediente, initH)
            
            if colaborador.horario_final_expediente is None:
                finalH = 0
                finalM = 0

            autority = is_Gestor(colaborador)
            lista_colaboradores.append({
                "nome": colaborador.nome,
                "username": colaborador.username,
                "email": colaborador.email,
                'admin': autority["ADM"],
                'gestor': autority['Gestor'],
                "imagem": colaborador.imagem if colaborador.imagem else None,
                "is_active": colaborador.is_active,
                "horario": {
                    "initH": initH,
                    "finalH": finalH,
                    "initM": initM,
                    "finalM": finalM
                }
            })

        colaboradoresINFO['lista'] = lista_colaboradores
        colaboradoresINFO['admin'] = Colaborador_Setor.objects.filter(codigoColaborador=user).exists()

        res = [setorINFO, colaboradoresINFO]

        return Response(data={"Data": res}, status=200)

class UpdateADMSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        collaborator = request.data['username']
        opType = request.data['opType']
        if not Setor.objects.filter(codigoColaboradorGestor=user):
            return Response(status=401)
        
        collaborator = Colaborador_Setor.objects.filter(codigoColaborador__username=collaborator).first()

        if opType:
            collaborator.administradorColaboradorSetor = True
        else:
            collaborator.administradorColaboradorSetor = False

        collaborator.save()

        return Response(status=200)
    
class DeactivateReactivateSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.data['username']
        opType = request.data['opType']

        print(user)
        user = Colaborador.objects.filter(username=user).first()
        if not user:
            return Response(status=401)

        if opType:
            user.is_active = True
            user.save()
            return Response(status=200)
        
        user.is_active = False
        user.save()
        return Response(status=200)

class updateCollaboratorSetorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """ Em desenvolvimento. Implementar junto a função de Redefinição de senha na aplicação APIUserAuth 
        
        TERMINAR DE PASSAR A INFORMAÇÃO DO HORÁRIO PARA A API DE CONSULTA"""
        name = request.data['name']
        username = request.data['username']
        email = request.data['email']
        print(name, username, email)
        user = Colaborador.objects.filter(username=username).first()

        if not user.DoesNotExist:
            return Response(data={"Data": "Usuário não encontrado ou e-mail não encontrado."}, status=401)
        
        if not ('@' in email and '.' in email):
            return Response(data={"Data": "Email não está de acordo com o padrão de emails."}, status=401)
        
        if len(name) < 3:
            return Response(data={"Data": "Nome muito pequeno!"}, status=401)
        try:
            user.nome = name
            user.save()
        except:
            return Response(data={"Data": "Erro ao alterar o nome do usuário."}, status=401)

        try:
            user.email = email
            user.save()
        except:
            return Response(data={"Data": "Erro ao alterar o nome do usuário."}, status=401)
        
        
        return Response(data={"Data": "Dados alterados!"}, status=200)
        
class createCodigoChave(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        verifica_colaborador_setor = Colaborador_Setor.objects.filter(codigoColaborador=user).first()
        setor_atual = verifica_colaborador_setor.codigoSetor

        if not verifica_colaborador_setor.administradorColaboradorSetor or not Setor.objects.filter(codigoColaboradorGestor=user).first():
            return Response(data={"Usuário não tem permissão para completar a ação."}, status=401)
        
        if setor_atual:
            setor_atual.codigoChave = None
            setor_atual.save()
        
        chave_gerada = ''.join(choices(ascii_lowercase, k=3))
        chave_gerada += ''.join([str(randint(0, 9)) for x in range(3)])

        setor_atual.codigoChave = chave_gerada
        setor_atual.save()
        
        return Response(data={"Sucesso": "Código Chave gerado com sucesso."}, status=200)

