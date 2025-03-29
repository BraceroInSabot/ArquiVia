from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.APISetor.models import Colaborador_Setor
from datetime import datetime
from django.utils.formats import date_format
from django.utils import timezone
from core.settings import settings

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