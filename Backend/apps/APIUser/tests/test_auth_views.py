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
        
        