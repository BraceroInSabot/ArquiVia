import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image

User = get_user_model()

@pytest.mark.django_db
class TestEditUserAPI:
    """
    Suíte de testes para o endpoint EditUserView (PATCH).
    """

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def scenario_data(self):
        """Cria um usuário padrão para os testes."""
        user1 = User.objects.create_user(
            username="usuario_teste",
            email="teste@example.com",
            password="SenhaForte123!",
            name="Nome Original"
        )
        return user1


    def test_edit_user_text_fields_success(self, api_client, scenario_data):
        """
        Testa a atualização parcial de campos de texto (Nome e Email).
        """
        user = scenario_data
        url = reverse('editar-usuario', kwargs={'username': user.username}) 
        
        api_client.force_authenticate(user=user)
        
        payload = {
            "name": "Nome Atualizado",
            "email": "novoemail@example.com"
        }
        
        response = api_client.patch(url, payload, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True
        assert response.data['data']['name'] == payload['name']
        assert response.data['data']['email'] == payload['email']
        
        user.refresh_from_db()
        assert user.name == "Nome Atualizado"
        assert user.email == "novoemail@example.com"

    def test_edit_user_partial_update_success(self, api_client, scenario_data):
        """
        Testa se enviar apenas UM campo mantém os outros inalterados (partial=True).
        """
        user = scenario_data
        url = reverse('editar-usuario', kwargs={'username': user.username})
        
        api_client.force_authenticate(user=user)
        
        payload = {"name": "Apenas Nome Mudou"}
        
        response = api_client.patch(url, payload, format='json')
        
        assert response.status_code == 200
        
        user.refresh_from_db()
        assert user.name == "Apenas Nome Mudou"
        assert user.email == "teste@example.com" # Não mudou

    def test_edit_user_image_success(self, api_client, scenario_data):
        """
        Testa o upload de imagem de perfil.
        Requer que a View tenha 'parser_classes = [MultiPartParser, ...]'
        """
        user = scenario_data
        url = reverse('editar-usuario', kwargs={'username': user.username})
        api_client.force_authenticate(user=user)
        
        output = BytesIO()
        img = Image.new("RGB", (100, 100), color="blue")
        img.save(output, format="JPEG")
        output.seek(0)

        file_obj = SimpleUploadedFile(
            name="avatar_novo.jpg",
            content=output.getvalue(),
            content_type="image/jpeg"
        )

        payload = {
            "name": "User Com Foto",
            "image": file_obj
        }

        response = api_client.patch(url, payload, format='multipart')

        assert response.status_code == 200
        
        user.refresh_from_db()
        assert user.image is not None
        assert "avatar_novo" in user.image.name or ".jpg" in user.image.name


    def test_edit_user_not_authenticated_fail(self, api_client, scenario_data):
        """
        Testa se usuário anônimo recebe 401.
        """
        url = reverse('editar-usuario', kwargs={'username': scenario_data.username})
        
        payload = {"name": "Hacker"}
        response = api_client.patch(url, payload, format='json')
        
        assert response.status_code == 401

    def test_edit_user_not_found_fail(self, api_client, scenario_data):
        """
        Testa a edição de um username que não existe (404).
        """
        api_client.force_authenticate(user=scenario_data)
        
        url = reverse('editar-usuario', kwargs={'username': 'fantasma_inexistente'})
        
        payload = {"name": "Novo Nome"}
        response = api_client.patch(url, payload, format='json')
        
        assert response.status_code == 404

    def test_edit_user_invalid_data_fail(self, api_client, scenario_data):
        """
        Testa se o serializer barra dados inválidos (ex: email incorreto).
        """
        user = scenario_data
        url = reverse('editar-usuario', kwargs={'username': user.username})
        api_client.force_authenticate(user=user)
        
        payload = {
            "email": "isto-nao-eh-um-email" # Formato inválido
        }
        
        response = api_client.patch(url, payload, format='json')
        
        assert response.status_code == 400