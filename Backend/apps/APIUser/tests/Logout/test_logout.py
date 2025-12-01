import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from pytest_mock import MockerFixture
 
User = get_user_model()

@pytest.mark.django_db
class TestLogoutAPI:
    """
    Test suite for the logout endpoint (/sair/).
    """

    def scenario_data(self):
        """
        Provides common data for the tests.

        Returns:
            dict: A dictionary containing common test data.
        """
        user: User = User.objects.create_user( # type: ignore
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )
        return {
            "user": user,
        }   
    
    @pytest.mark.django_db
    def test_logout_success(self) -> None:
        """
        Tests if a user can log out successfully.

        Args:
            self: The test instance.
        
        Returns:
            None
        """
        
        user = self.scenario_data()['user']
        client = APIClient()
        client.force_authenticate(user=user)
        
        logout_url: str = reverse("sair")
        logout_response: DRFResponse = client.post(logout_url, format='json') # type: ignore
        assert logout_response.status_code == 200 # type: ignore
        assert logout_response.data['sucesso'] is True # type: ignore
        assert logout_response.data['mensagem'] == "Usuário deslogado com sucesso!" # type: ignore
        assert 'access_token' in logout_response.cookies # type: ignore
        assert 'refresh_token' in logout_response.cookies # type: ignore
        assert logout_response.cookies['access_token']['max-age'] == 0 # type: ignore
        assert logout_response.cookies['refresh_token']['max-age'] == 0 # type: ignore
    
    @pytest.mark.django_db
    def test_logout_without_login_fail(self) -> None:
        """
        Tests if logout fails when the user is not logged in.

        Args:
            self: The test instance.
        
        Returns:
            None
        """
        client = APIClient()
        logout_url: str = reverse("sair")
        logout_response: DRFResponse = client.post(logout_url, format='json') # type: ignore
        assert logout_response.status_code == 403 # type: ignore
        assert logout_response.data['sucesso'] is False # type: ignore
        assert logout_response.data['mensagem'] == "Usuário não encontrado." # type: ignore
        
    @pytest.mark.django_db
    def test_logout_fails_on_user_save_error_fail(self, mocker: MockerFixture) -> None:
        """
        Tests if the view returns a 400 error if saving the user's 
        last_login date fails.

        Args:
            self: The test instance.
            mocker: The pytest-mock fixture.
        
        Returns:
            None
        """
        user = self.scenario_data()['user']
        client = APIClient()
        client.force_authenticate(user=user)
        
        mocker.patch(
            'apps.APIUser.models.AbsUser.save', 
            side_effect=Exception("Simulated database error on save")
        )
        
        logout_url: str = reverse("sair")
        
        logout_response: DRFResponse = client.post(logout_url, format='json') # type: ignore

        assert logout_response.status_code == 400 # type: ignore
        assert logout_response.data['sucesso'] is False # type: ignore
        assert logout_response.data['mensagem'] == "Erro ao registrar data de saída do usuário." # type: ignore

    @pytest.mark.django_db
    def test_logout_fails_when_cookies_is_not_deleted_fail(self, mocker: MockerFixture) -> None:
        """
        Tests if the view returns a 400 error if there is an
        internal failure when trying to delete the cookies.

        Args:
            self: The test instance.
            mocker: The pytest-mock fixture.
        Returns:
            None
        """
        user = self.scenario_data()['user']
        client = APIClient()
        client.force_authenticate(user=user)
        
        mocker.patch(
            'rest_framework.response.Response.delete_cookie',
            side_effect=Exception("Simulando erro ao deletar cookie")
        )
        
        logout_url: str = reverse("sair")
        logout_response: DRFResponse = client.post(logout_url, format='json') # type: ignore
        
        assert logout_response.status_code == 400 # type: ignore
        assert logout_response.data['sucesso'] is False # type: ignore
        assert logout_response.data['mensagem'] == "Erro ao deslogar usuário." # type: ignore
