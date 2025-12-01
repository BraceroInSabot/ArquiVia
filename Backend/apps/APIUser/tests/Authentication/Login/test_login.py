import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from pytest_mock import MockerFixture
 
User = get_user_model()

@pytest.mark.django_db
class TestLoginAPI:
    """
    Test suite for the login endpoint (/entrar/).
    """

    # Success
    def test_login_success(self) -> None:
        """
        Tests if a user can log in with valid credentials.

        Args:
            self: The test instance.
        
        Returns:
            None
        """
        user: User = User.objects.create_user( # type: ignore
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )
        
        valid_payload: dict[str, str] = {
            "username": "test",
            "password": "Test-10#"
        }
        url: str = reverse("entrar")
        client = APIClient()
        response: DRFResponse = client.post(url, valid_payload, format='json') # type: ignore
        
        assert response.status_code == 200 # type: ignore
        assert 'access_token' in response.cookies # type: ignore
        assert 'refresh_token' in response.cookies # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['mensagem'] == "Usuário autenticado com sucesso!" # type: ignore

    # FAILURES
    def test_login_invalid_password_fail(self) -> None:
        """
        Tests if login fails with an invalid password.

        Args:
            self: The test instance.
        
        Returns:
            None
        """
        User.objects.create_user(
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )
        invalid_payload: dict[str, str] = {
            "username": "test",
            "password": "WrongPassword"
        }
        url: str = reverse("entrar")
        client = APIClient()
        response: DRFResponse = client.post(url, invalid_payload, format='json') #  type: ignore
        assert response.status_code == 401 # type: ignore
        assert 'access_token' not in response.cookies # type: ignore
        assert 'refresh_token' not in response.cookies # type: ignore
        assert response.data['sucesso'] is False # type: ignore
        assert response.data['mensagem'] == "Usuário e/ou senha incorreto(s)" # type: ignore

    def test_login_cookies_missing_fail(self, mocker: MockerFixture) -> None:
        """
        Tests if the view returns a 400 error if there is an
        internal failure when trying to set the cookies.
        
        Args:
            self: The test instance.
            mocker: The pytest-mock fixture.
            
        Returns:
            None
        """
        User.objects.create_user(
            username="test2",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )

        login_payload: dict[str, str] = {
            'username': 'testlogin',
            'password': 'Test-10#'
        }
        url: str = reverse('entrar')

        mocker.patch(
            'rest_framework.response.Response.set_cookie',
            side_effect=Exception("Simulando erro ao salvar cookie")
        )

        client = APIClient()

        response: DRFResponse = client.post(url, login_payload, format='json') # type: ignore

        assert response.status_code == 401 # type: ignore
        assert response.data['sucesso'] is False # type: ignore
        assert response.data['mensagem'] == "Usuário e/ou senha incorreto(s)" # type: ignore
