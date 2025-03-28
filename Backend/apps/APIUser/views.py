from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Colaborador_Setor

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

        infos = {
            "nome": request.user.nome,
            "email": request.user.email,
            "setor": setor_usuario,
            "data_criacao": request.user.date_joined,
            "ultimo_login": request.user.last_login,
            "inicio_expediente": request.user.horario_inicio_expediente,
            "final_expediente": request.user.horario_final_expediente,
        }

        return Response({"usuario": [infos]}, status=200)