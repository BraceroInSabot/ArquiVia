import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@pytest.mark.django_db
class TestRefreshTokenAPI:
    """
    Test suite for the token refresh endpoint (/atualizar-token/).
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
    
    def test_refresh_token_success(self) -> None:
        user = self.scenario_data()['user']
        client = APIClient()
        
        refresh_token_obj = RefreshToken.for_user(user)
        original_access_token = str(refresh_token_obj.access_token)
        original_refresh_token = str(refresh_token_obj)

        client.cookies['refresh_token'] = original_refresh_token
        client.cookies['access_token'] = original_access_token

        refresh_url: str = reverse("atualizar-token")
        refresh_response = client.post(refresh_url, format='json') # type: ignore

        assert refresh_response.status_code == 200 # type: ignore
        assert refresh_response.data['sucesso'] is True # type: ignore 
        assert refresh_response.data['mensagem'] == "Token renovado com sucesso!" # type: ignore
        
        assert 'access_token' in refresh_response.cookies # type: ignore
        new_access_token: str = refresh_response.cookies['access_token'].value # type: ignore 
        
        assert new_access_token != original_access_token
    
    # Failures
    def test_refresh_token_no_cookie_fails(self) -> None:
        client = APIClient()
        refresh_url: str = reverse("atualizar-token")
        refresh_response: DRFResponse = client.post(refresh_url, format='json') # type: ignore

        assert refresh_response.status_code == 500 # type: ignore
        assert refresh_response.data['sucesso'] is False # type: ignore
        assert refresh_response.data['mensagem'] == "Houve erros internos na aplicação." # type: ignore
