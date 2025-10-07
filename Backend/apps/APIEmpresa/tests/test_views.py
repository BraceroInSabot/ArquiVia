import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from rest_framework.request import Request as DRFRequest
from pytest_mock import MockerFixture # type: ignore
from apps.APIEmpresa.models import Enterprise

User = get_user_model()

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
        