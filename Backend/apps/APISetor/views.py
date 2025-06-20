from django.shortcuts import render
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Sector, KeyCodeSector