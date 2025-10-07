from typing import Dict, List
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from rest_framework.request import Request as DRFRequest
from pytest_mock import MockerFixture # type: ignore
from apps.APIEmpresa.models import Enterprise
from unittest.mock import patch

User = get_user_model()

class UtilsTest():
    def create_many_users(self, units: int) -> List[str]:
        password_test: str = "Test#10"
        usernames: List[str] = [] 
        
        for u in range(units):
            username: str = f"test{u*10}"
            user: User = User.objects.create_user( # type: ignore
                username=username,
                name="This is a Test",
                email=f"test{u*10}@gmail.com",
                password=password_test,
            )
            
            usernames.append(username)
            
        return usernames
        
    def create_enterprise(self, client: APIClient) -> DRFResponse:
        valid_payload: Dict[str, str]= {
            "name": "Test Enterprise 123 Arquivia Testing",
            "image": "http://example.com/image.png"
        }
        
        url_create: str = reverse("criar-empresa")
        response: DRFResponse = client.post(url_create, valid_payload, format='json') # type: ignore
        
        return response
        

@pytest.mark.django_db
class TestCreateEnterpriseAPI:
    """
    Test suite for the create enterprise endpoint (/criar).
    """
    
    # Success
    
    def test_create_enterprise_success(self):
        """
        Test creating an enterprise successfully.
        
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
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        valid_payload = {
            "name": "Test Enterprise 123 Arquivia Testing",
            "image": "http://example.com/image.png"
        }
        
        url: str = reverse("criar-empresa")
        response: DRFResponse = client.post(url, valid_payload, format='json') # type: ignore
        
        assert response.status_code == 201
        assert response.data["sucesso"] == True # type: ignore
        assert Enterprise.objects.filter(enterprise_id = response.data["data"]["enterprise_id"]).exists() # type: ignore
    
    # Failures
    
    def test_anonymous_user_fails(self):
        """
        Test if anonymous user can create an enterprise.
        
        Args:
            self: The test instance.
        
        Returns:
            None
        """
        client = APIClient()
        valid_payload = {
            "name": "Test Enterprise 123 Arquivia Testing",
            "image": "http://example.com/image.png"
        }
        
        url: str = reverse("criar-empresa")
        response: DRFResponse = client.post(url, valid_payload, format='json') # type: ignore
        
        assert response.status_code == 401
        assert response.data["sucesso"] == False # type: ignore
        
    def test_object_save_error_fails(self, mocker: MockerFixture):
        """
        Test the result of when the object fails to save.
        
        Args:
            self: The test instance.
            mocker (MockerFixture): intend to be a failure on a determinated method
            
        Returns:
            None
        """ 
        user: User = User.objects.create_user( # type: ignore
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        valid_payload = {
            "name": "Test Enterprise 123 Arquivia Testing",
            "image": "http://example.com/image.png"
        }
        
        mocker.patch(
            'apps.APIEmpresa.models.Enterprise.save', 
            side_effect=Exception("Simulated Database Save Error")
        )
        
        url: str = reverse("criar-empresa")
        response: DRFResponse = client.post(url, valid_payload, format='json') # type: ignore
        
        assert response.status_code == 400
        assert response.data["sucesso"] == False # type: ignore

@pytest.mark.django_db
class TestRetrieveEnterpriseAPI:
    
    # Success
    
    def test_retrieve_enterprise_data_success(self):
        """
        Test if the API is working by retrieving the enterprise data for user.
        
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
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        valid_payload: Dict[str, str]= {
            "name": "Test Enterprise 123 Arquivia Testing",
            "image": "http://example.com/image.png"
        }
        
        url_create: str = reverse("criar-empresa")
        response: DRFResponse = client.post(url_create, valid_payload, format='json') # type: ignore
        
        valid_enterprise: int = response.data["data"]["enterprise_id"] #type: ignore
        
        url_retrieve: str = reverse("consultar-empresa", kwargs={'pk': valid_enterprise})
            
        response: DRFResponse = client.get(url_retrieve, {"enterprise_id": valid_enterprise}, format="json") #type: ignore
        
        assert response.status_code == 200
        assert response.data['sucesso'] == True # type: ignore
        assert response.data['data']['enterprise_id'] == 1 # type: ignore
        
    # Failures
    
    def test_retrieve_enterprise_data_for_anonymous_fails(self):
        """
        Test if non logged users can read Enterprise info.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        user = User.objects.create_user(
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        )
        client = APIClient()
        client.force_authenticate(user=user)
        res = UtilsTest().create_enterprise(client)
        
        valid_enterprise: int = res.data["data"]["enterprise_id"] #type: ignore
        
        # Create a new, unauthenticated client
        anonymous_client = APIClient()
        
        url_retrieve: str = reverse("consultar-empresa", kwargs={'pk': valid_enterprise})
            
        response: DRFResponse = anonymous_client.get(url_retrieve, format="json") #type: ignore
        
        assert response.status_code == 401
        assert response.data['sucesso'] == False # type: ignore
        assert response.data['mensagem'] == 'As credenciais de autenticação não foram fornecidas.' #type: ignore
        
    def test_retrieve_enterprise_data_for_non_linked_users_fails(self):
        """
        Test if another users, wich are not linked to enterprise, can access the enterprise data.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        create_users = UtilsTest().create_many_users(2)
        
        client = APIClient()
        
        # Authenticate as user 1 and create the enterprise
        user1 = User.objects.get(username=create_users[0])
        client.force_authenticate(user=user1)
        response_1: DRFResponse = UtilsTest().create_enterprise(client)
        
        # Authenticate as user 2
        user2 = User.objects.get(username=create_users[1])
        client.force_authenticate(user=user2)
        
        valid_enterprise = response_1.data["data"]["enterprise_id"] #type: ignore
        
        url_retrieve: str = reverse("consultar-empresa", kwargs={'pk': valid_enterprise})
            
        response: DRFResponse = client.get(url_retrieve, format="json") #type: ignore
        
        assert response.status_code == 403
        assert response.data['sucesso'] == False # type: ignore
        assert response.data['mensagem'] == 'Usuário sem permissão para completar a operação.' # type: ignore
        
    @patch('apps.APIEmpresa.models.Enterprise.objects.get')
    def test_retrieve_enterprise_data_with_broken_operation_fails(self, mock_get):
        """
        Test what would be the return for client-side when backend brokes.
        
        Args:
            self: The test instance.
            mock_get: The mock object injected by @patch.
        """
        mock_get.side_effect = Exception("Simulated Database Query Error")
        user = User.objects.create_user(
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        ) 
        client = APIClient()
        client.force_authenticate(user=user)
        
        url_retrieve = reverse("consultar-empresa", kwargs={'pk': 123})
        
        response = client.get(url_retrieve, format="json")
      
        assert response.status_code == 500 # type: ignore
        
    def test_non_existent_enterprise_fails(self):
        """
        Test if user can query non existent enterprises.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        user = User.objects.create_user(
            username="test",
            name="This is a Test",
            email="test@gmail.com",
            password="Test-10#",
        ) 
        client = APIClient()
        client.force_authenticate(user=user)
        
        url_retrieve: str = reverse("consultar-empresa", kwargs={'pk': 500})
            
        response: DRFResponse = client.get(url_retrieve, format="json") #type: ignore
        
        assert response.status_code == 404
        assert response.data['sucesso'] == False # type: ignore
        