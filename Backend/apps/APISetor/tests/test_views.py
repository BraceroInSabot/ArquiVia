import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Dict

from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser

User = get_user_model()


@pytest.mark.django_db
class TestCreateSectorAPI:
    """
    Test suite for the Create Sector endpoint (/criar-setor).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """
        Returns an APIClient instance for use in tests.
        """
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict:
        """
        Creates a scenario with users and an enterprise for permission tests.
        - owner1: Owns 'Enterprise 1'.
        - outsider: An authenticated user who does not own 'Enterprise 1'.
        - enterprise1: The enterprise owned by owner1.
        - existing_sector_name: A sector that already exists in enterprise1, for duplicate testing.
        
        Returns:
            Dict: A dictionary containing the scenario data.
        """
    
        owner1 = User.objects.create_user(username="owner1_sector", password="pw", email="owner1@gmail.com", name="Owner 1")
        outsider = User.objects.create_user(username="outsider_sector", password="pw", email="outsider@gmail.com", name="Outsider")

    
        enterprise1 = Enterprise.objects.create(name="Enterprise 1", owner=owner1)
        
    
        existing_sector = Sector.objects.create(
            name="Financeiro",
            enterprise=enterprise1,
            manager=owner1
        )

    
        return {
            "owner1": owner1,
            "outsider": outsider,
            "enterprise1": enterprise1,
            "existing_sector_name": existing_sector.name
        }



    def test_create_sector_by_owner_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if the enterprise owner can successfully create a new sector.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data["owner1"]
        enterprise = scenario_data["enterprise1"]
        api_client.force_authenticate(user=owner)
        
        url = reverse("criar-setor")
        valid_payload = {
            "name": "Recursos Humanos",
            "image": "rh.png",
            "enterprise_id": enterprise.pk
        }

        response: DRFResponse = api_client.post(url, valid_payload, format="json") #type: ignore

        assert response.status_code == 201
        assert response.data['sucesso'] is True #type: ignore
        
        new_sector = Sector.objects.get(name="Recursos Humanos", enterprise=enterprise)
        assert new_sector is not None
        assert new_sector.manager == owner



    def test_create_sector_by_non_owner_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if a user who is not the owner of the enterprise receives a 403 Forbidden error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        outsider = scenario_data["outsider"]
        enterprise = scenario_data["enterprise1"]
        api_client.force_authenticate(user=outsider) 
        
        url = reverse("criar-setor")
        payload = {
            "name": "Tentativa de Setor",
            "image": "fail.png",
            "enterprise_id": enterprise.pk
        }

        response: DRFResponse = api_client.post(url, payload, format="json")  #type: ignore

        assert response.status_code == 403
        assert response.data['sucesso'] is False #type: ignore

    def test_create_sector_with_duplicate_name_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if creating a sector with a name that already exists in the same enterprise fails.
        """
        owner = scenario_data["owner1"]
        enterprise = scenario_data["enterprise1"]
        existing_name = scenario_data["existing_sector_name"]
        api_client.force_authenticate(user=owner)
        
        url = reverse("criar-setor")
        invalid_payload = {
            "name": existing_name,
            "image": "duplicate.png",
            "enterprise_id": enterprise.pk
        }

    
        response: DRFResponse = api_client.post(url, invalid_payload, format="json") #type: ignore
        
        assert response.status_code == 400
        assert response.data['sucesso'] is False #type: ignore
        assert "Um setor com este nome já existe nesta empresa" in str(response.data)


User = get_user_model()


@pytest.mark.django_db
class TestRetrieveSectorAPI:
    """
    Test suite for the Retrieve Sector endpoint (/consultar/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, str | object]:
        """
        Creates a scenario with an owner, a sector member, and an outsider.
        
        Returns:
            Dict[str, str]: A dictionary containing the scenario data.
        """
        # 1. Cria três possíveis usuários
        owner = User.objects.create_user(username="sector_owner", password="pw", email="owner@gmail.com", name="Owner")
        member = User.objects.create_user(username="sector_member", password="pw", email="member@gmail.com", name="Member")
        outsider = User.objects.create_user(username="sector_outsider", password="pw", email="outsider@gmail.com", name="Outsider")

        # 2. Cria a empresa que possui o setor
        enterprise = Enterprise.objects.create(name="Test Corp for Sector", owner=owner)
        
        # 3. Cria o Setor alvo dos testes
        sector = Sector.objects.create(name="Engineering", enterprise=enterprise, manager=owner)
        
        # 4. Vincula o 'member' ao setor
        SectorUser.objects.create(user=member, sector=sector)

        return {
            "owner": owner,
            "member": member,
            "outsider": outsider,
            "sector": sector,
        }

    # Success

    def test_retrieve_sector_by_owner_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if the enterprise owner can successfully retrieve sector details.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data["owner"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=owner)
        url = reverse("consultar-setor", kwargs={'pk': sector.pk})

        response: DRFResponse = api_client.get(url)  #type: ignore

        assert response.status_code == 200
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['data']['name'] == "Engineering" #type: ignore

    def test_retrieve_sector_by_member_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if a member of the sector can successfully retrieve its details.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        member = scenario_data["member"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=member)
        url = reverse("consultar-setor", kwargs={'pk': sector.pk})

        response: DRFResponse = api_client.get(url) #type: ignore

        assert response.status_code == 200
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['data']['sector_id'] == sector.pk #type: ignore

    # Failures

    def test_retrieve_non_existent_sector_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if requesting a non-existent sector ID returns a 404 Not Found error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data["owner"]
        api_client.force_authenticate(user=owner)
        non_existent_pk = 999
        url = reverse("consultar-setor", kwargs={'pk': non_existent_pk})

        response: DRFResponse = api_client.get(url)  #type: ignore

        assert response.status_code == 404
        assert response.data['sucesso'] is False  #type: ignore
        assert response.data['mensagem'] == "Setor não encontrado."  #type: ignore

    def test_retrieve_sector_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an unauthenticated (anonymous) user receives a 401 Unauthorized error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        sector = scenario_data["sector"]
        url = reverse("consultar-setor", kwargs={'pk': sector.pk})

        response: DRFResponse = api_client.get(url)  #type: ignore

        assert response.status_code == 401
        assert response.data['sucesso'] is False #type: ignore
        assert "As credenciais de autenticação não foram fornecidas" in response.data['mensagem'] #type: ignore

    def test_retrieve_sector_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an authenticated but non-member/non-owner user receives a 403 Forbidden error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        outsider = scenario_data["outsider"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=outsider) # Autenticado, mas sem permissão
        url = reverse("consultar-setor", kwargs={'pk': sector.pk})

        response: DRFResponse = api_client.get(url)  #type: ignore

        assert response.status_code == 403
        assert response.data['sucesso'] is False  #type: ignore
        assert "Você não tem permissão para acessar este setor" in response.data['mensagem'] #type: ignore