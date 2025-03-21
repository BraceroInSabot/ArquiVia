from django.shortcuts import render
from django.views.generic import ListView
from .models import Setor

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

class SetorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        setores = Setor.objects.filter(colaborador_setor__codigoColaborador=user)

        return Response({"setores": [[setor.codigoSetor, setor.nomeSetor] for setor in setores]})