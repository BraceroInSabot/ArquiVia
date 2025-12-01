import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from rest_framework.request import Request as DRFRequest
from pytest_mock import MockerFixture

from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser # type: ignore
 
User = get_user_model()

@pytest.mark.django_db
class TestLogoutAPI:
    """
    Test suite for the logout endpoint (/sair).
    """

    # Success
    
    @pytest.mark.django_db
    def test_logout_success(self) -> None:
        """
        Tests if a user can log out successfully.

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
        valid_login_payload: dict[str, str] = {
            "username": "test",
            "password": "Test-10#"
        }
        
        login_url: str = reverse("entrar")
        client = APIClient()
        login_response: DRFResponse = client.post(login_url, valid_login_payload, format='json') # type: ignore
        assert login_response.status_code == 200 # type: ignore
        assert 'access_token' in login_response.cookies # type: ignore
        assert 'refresh_token' in login_response.cookies # type: ignore
        
        logout_url: str = reverse("sair")
        logout_response: DRFResponse = client.post(logout_url, format='json') # type: ignore
        assert logout_response.status_code == 200 # type: ignore
        assert logout_response.data['sucesso'] is True # type: ignore
        assert logout_response.data['mensagem'] == "Usuário deslogado com sucesso!" # type: ignore
        assert 'access_token' in logout_response.cookies # type: ignore
        assert 'refresh_token' in logout_response.cookies # type: ignore
        assert logout_response.cookies['access_token']['max-age'] == 0 # type: ignore
        assert logout_response.cookies['refresh_token']['max-age'] == 0 # type: ignore
    
    # Failures
    @pytest.mark.django_db
    def test_logout_without_login_fails(self) -> None:
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
    def test_logout_fails_on_user_save_error(self, mocker: MockerFixture) -> None:
        """
        Tests if the view returns a 400 error if saving the user's 
        last_login date fails.

        Args:
            self: The test instance.
            mocker: The pytest-mock fixture.
        
        Returns:
            None
        """
        user: User = User.objects.create_user( # type: ignore
            username="test_save_error",
            password="Test-10#",
            email="save_error@example.com",
            name="Test User"
        )
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
    def test_logout_fails_when_cookies_is_not_deleted(self, mocker: MockerFixture) -> None:
        """
        Tests if the view returns a 400 error if there is an
        internal failure when trying to delete the cookies.

        Args:
            self: The test instance.
            mocker: The pytest-mock fixture.
        Returns:
            None
        """
        user: User = User.objects.create_user( # type: ignore
            username="test_save_error",
            password="Test-10#",
            email="save_error@example.com",
            name="Test User"
        )
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
        
class TestRefreshTokenAPI:
    """
    Test suite for the token refresh endpoint (/atualizar-token).
    """

    @pytest.mark.django_db
    class TestRefreshTokenAPI:
        def test_refresh_token_success(self) -> None:
            user: User = User.objects.create_user( # type: ignore
                username="test_refresh",
                password="Test-10#",
                email="refresh@example.com",
                name="Test User"
            )
            client = APIClient()

            login_url: str = reverse("entrar")
            login_payload: dict[str, str] = {
                "username": "test_refresh",
                "password": "Test-10#"
            }
            login_response: DRFResponse = client.post(login_url, login_payload, format='json') # type: ignore
            
            assert login_response.status_code == 200
            assert 'refresh_token' in login_response.cookies

            original_access_token: str = login_response.cookies['access_token'].value

            refresh_url: str = reverse("atualizar-token")
            refresh_response: DRFResponse = client.post(refresh_url, format='json') # type: ignore

            assert refresh_response.status_code == 200
            assert refresh_response.data['sucesso'] is True # type: ignore
            assert refresh_response.data['mensagem'] == "Token renovado com sucesso!" # type: ignore
            
            assert 'access_token' in refresh_response.cookies
            new_access_token: str = refresh_response.cookies['access_token'].value
            assert new_access_token != original_access_token
        
        # Failures
        def test_refresh_token_no_cookie_fails(self) -> None:
            client = APIClient()
            refresh_url: str = reverse("atualizar-token")
            refresh_response: DRFResponse = client.post(refresh_url, format='json') # type: ignore

            assert refresh_response.status_code == 500 # type: ignore
            assert refresh_response.data['sucesso'] is False # type: ignore
            assert refresh_response.data['mensagem'] == "Houve erros internos na aplicação." # type: ignore

@pytest.mark.django_db           
class TestUserRetrieveAPI:
    
    @pytest.fixture
    def api_client(self):
        """
        Returns a API CLIENT for use.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        return APIClient()

    @pytest.fixture
    def scenario_data(self):
        """
        Create a scenario with multiple users, enterprises and sectors for enterprises
        visibility tests and permissions.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        # 1. Create 2 users
        user1 = User.objects.create_user(username="owner1", password="pw", name="Owner 1", email="owner1@e.com")
        user2 = User.objects.create_user(username="owner2", password="pw", name="Owner 2", email="owner2@e.com")
        user3 = User.objects.create_user(username="worker3", password="pw", name="worker 3", email="worker3@e.com")
        
        # create 2 enterprises
        Enterprise.objects.create(name='Enterprise 1', owner=user1)
        Enterprise.objects.create(name='Enterprise 2', owner=user2)
        
        # link user 3 to Enterprise 2
        Sector.objects.create(enterprise_id=2, name="Sector ENT. 2", image="", manager=user2)
        SectorUser.objects.create(sector_id=1, user_id=3)

        return {
            "user1": user1,
            "user2": user2,
            "user3": user3
        }
    
    def test_retrieve_user_sucess(self, scenario_data: dict, api_client: APIClient):
        """
        Test if logged user can see it account data.

        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
        """
        url = reverse("consultar-usuario", kwargs={"username": "owner1"})
        api_client.force_authenticate(user=scenario_data["user1"])

        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore
        assert response.data['data']['username'] == "owner1" # type: ignore
        assert response.data['data']['name'] == "Owner 1" # type: ignore
        assert response.data['data']['email'] == "owner1@e.com" # type: ignore
        assert isinstance(response.data['data'], dict) # type: ignore

    def test_retrieve_inexistent_user_fails(self, scenario_data: dict, api_client: APIClient):
        """
        Test if logged user cannot see a non existent account data.
        
        Args:
            self: The test instance
            api_client (APIClient): api client for log in use
            scenario_data (dict): scenario for simulate a determinated environment
        """
        url = reverse("consultar-usuario", kwargs={"username": "inexistent"})

        test_user = scenario_data["user1"]
        api_client.force_authenticate(user=test_user)

        response = api_client.get(url)

        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] is False # type: ignore
        
    def test_retrieve_non_user_loggedin_fails(self, scenario_data: dict, api_client: APIClient):
        """
        Test if user can see another user data (linked and non-linked to his account). 

        Args:
            self = the test instance
            api_client (APIClient): api client for log in use
            scenario_data (dict): scenario for simulate a determinated environment
        """
        url = reverse("consultar-usuario", kwargs={"username": "owner1"})
        test_user = scenario_data["user2"]
        
        api_client.force_authenticate(user=test_user)

        response = api_client.get(url)

        assert response.status_code == 403 # type: ignore
        assert response.data['sucesso'] is False # type: ignore
        
        url = reverse("consultar-usuario", kwargs={"username": "worker3"})
        
        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        
        