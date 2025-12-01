import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Type, Any
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image
 
User = get_user_model()

@pytest.mark.django_db
class TestRegisterAPI:
    """
    Test suite for the user registration endpoint (/criar-conta).
    """

    # Success
    def test_create_user_no_image_success(self) -> None:
        """
        Tests if a user can be created successfully with valid data.

        Args:
            self: The test instance.
        
        Returns:
            None
        """
        valid_payload: dict[str, str] = {
            "username": "testuser",
            "name": "Test User Full Name",
            "email": "test@example.com",
            "password": "StrongP@ssword1",
            "cpassword": "StrongP@ssword1"
        }
        url: str = reverse("criar-conta")
        client = APIClient()

        response: DRFResponse = client.post(url, valid_payload, format='json') # type: ignore

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['mensagem'] == "Usuário cadastrado com sucesso!" # type: ignore

        created_user: User | None = User.objects.filter(username=valid_payload['username']).first() # type: ignore
        assert created_user is not None
        assert User.objects.filter(email=valid_payload['email']).exists()
        assert User.objects.filter(email=valid_payload['email']).count() == 1

    def test_create_user_image_success(self) -> None:
        """
        Tests if a user can be created successfully with a profile image.
        """
        # 1. Gerar uma imagem válida em memória (RAM)
        # Isso evita erros de "arquivo não encontrado" e é muito mais rápido
        output = BytesIO()
        img = Image.new("RGB", (100, 100), color="red") # Cria uma imagem 100x100 vermelha
        img.save(output, format="JPEG") # Salva como JPEG no buffer
        output.seek(0) # Volta o ponteiro para o início do arquivo

        # 2. Envelopar no objeto que o Django entende como Upload
        file_obj = SimpleUploadedFile(
            name="test_avatar.jpg",
            content=output.getvalue(),
            content_type="image/jpeg"
        )

        valid_payload: dict[str, str | Any] = {
            "username": "testuserimg",
            "name": "Test User With Image",
            "email": "test_img@example.com",
            "password": "StrongP@ssword1",
            "cpassword": "StrongP@ssword1",
            "image": file_obj 
        }
        
        url: str = reverse("criar-conta")
        client = APIClient()

        response = client.post(url, valid_payload, format='multipart') 
        
        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        created_user = User.objects.filter(username=valid_payload['username']).first()
        assert created_user is not None
        assert created_user.image is not None # type: ignore
        assert bool(created_user.image) is True # type: ignore
        assert "test_avatar" in created_user.image.name # type: ignore
        
    # Failures
    def test_create_user_password_mismatch_fails(self) -> None:
        """
        Tests if registration fails if the passwords do not match.
        
        Args:
            self: The test instance.
            
        Returns:
            None
        """
        invalid_payload: dict[str, str] = {
            "username": "testuser2",
            "name": "Test User 2",
            "email": "test2@example.com",
            "password": "StrongP@ssword1",
            "cpassword": "badpassword"
        }
        url: str = reverse("criar-conta")
        client = APIClient()

        response: DRFResponse = client.post(url, invalid_payload, format='json') # type: ignore

        assert response.status_code == 400 # type: ignore
        assert "Senhas não coincidem" in str(response.data) # type: ignore
        assert User.objects.filter(username=invalid_payload['username']).count() == 0
