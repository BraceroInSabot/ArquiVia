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
class TestAddUserToSectorAPI:
    """
    Test suite for the Add User to Sector endpoint (POST /adicionar-usuario/<int:pk>/).
    Note: The view code provided expects POST to /adicionar-usuario/ with pk in URL,
    but the previous discussion implied POST to a generic URL with pk in payload.
    These tests follow the view code provided (pk in URL).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict:
        """
        Creates a scenario with various users, enterprise, and sector.
        Roles: owner, manager, admin_worker, worker, outsider.
        Also includes users to be added and one already linked.
        """
        owner = User.objects.create_user(username="add_owner", password="pw", email="add_owner@e.com", name="Add Owner")
        manager = User.objects.create_user(username="add_manager", password="pw", email="add_manager@e.com", name="Add Manager")
        admin_worker = User.objects.create_user(username="add_admin", password="pw", email="add_admin@e.com", name="Add Admin")
        worker = User.objects.create_user(username="add_worker", password="pw", email="add_worker@e.com", name="Add Worker")
        outsider = User.objects.create_user(username="add_outsider", password="pw", email="add_outsider@e.com", name="Add Outsider")
        user_to_add = User.objects.create_user(username="add_target", password="pw", email="add_target@e.com", name="Add Target")
        already_linked_user = User.objects.create_user(username="add_linked", password="pw", email="add_linked@e.com", name="Add Linked")

        enterprise = Enterprise.objects.create(name="Add Corp", owner=owner)
        sector = Sector.objects.create(name="Add Sector", enterprise=enterprise, manager=manager)

        SectorUser.objects.create(user=admin_worker, sector=sector, is_adm=True)
        SectorUser.objects.create(user=worker, sector=sector, is_adm=False)
        SectorUser.objects.create(user=already_linked_user, sector=sector, is_adm=False)

        return {
            "owner": owner,
            "manager": manager,
            "admin_worker": admin_worker,
            "worker": worker,
            "outsider": outsider,
            "user_to_add": user_to_add,
            "already_linked_user": already_linked_user,
            "enterprise": enterprise,
            "sector": sector,
        }

    # Success

    @pytest.mark.parametrize("role", ["owner", "manager", "admin_worker"])
    def test_add_user_by_authorized_user_success(
        self, api_client: APIClient, scenario_data: Dict, role: str
    ) -> None:
        """
        Tests if authorized users (owner, manager, admin) can successfully add a user.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            roles: (str): Possible user roles
            
        Return:
            None
        """
        actor = scenario_data[role] 
        sector = scenario_data["sector"]
        user_to_add = scenario_data["user_to_add"]
        api_client.force_authenticate(user=actor)
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk}) 
        payload = {"user_email": user_to_add.email}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 201 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['mensagem'] == "Usuário adicionado ao setor com sucesso." # type: ignore
        
        assert SectorUser.objects.filter(sector=sector, user=user_to_add).exists()

    # Failures

    def test_add_user_to_non_existent_sector_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """Tests adding a user to a non-existent sector returns 404.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None"""
        owner = scenario_data["owner"] 
        user_to_add = scenario_data["user_to_add"]
        api_client.force_authenticate(user=owner)
        non_existent_pk = 999
        url = reverse("adicionar-usuario-setor", kwargs={'pk': non_existent_pk})
        payload = {"user_email": user_to_add.email}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_add_non_existent_user_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests adding a non-existent user (by email) returns 404.
        
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
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk})
        payload = {"user_email": "nonexistent@example.com"}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_add_user_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an unauthenticated user receives 401.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None"""
        sector = scenario_data["sector"]
        user_to_add = scenario_data["user_to_add"]
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk})
        payload = {"user_email": user_to_add.email}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 401 # type: ignore
        assert response.data['sucesso'] is False # type: ignore

    @pytest.mark.parametrize("role", ["worker", "outsider"])
    def test_add_user_by_unauthorized_user_fails(
        self, api_client: APIClient, scenario_data: Dict, role: str
    ) -> None:
        """
        Tests if unauthorized users (worker, outsider) receive 403.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            roles: (str): Possible user roles
            
        Return:
            None"""
        actor = scenario_data[role]
        sector = scenario_data["sector"]
        user_to_add = scenario_data["user_to_add"]
        api_client.force_authenticate(user=actor)
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk})
        payload = {"user_email": user_to_add.email}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 403 # type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_add_already_linked_user_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """Tests adding a user who is already in the sector returns 400.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None"""
        owner = scenario_data["owner"] 
        sector = scenario_data["sector"]
        already_linked_user = scenario_data["already_linked_user"]
        api_client.force_authenticate(user=owner)
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk})
        payload = {"user_email": already_linked_user.email}
        initial_link_count = SectorUser.objects.filter(sector=sector).count()

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400 # type: ignore
        assert response.data['sucesso'] is False # type: ignore
        assert response.data['mensagem'] == "Usuário já está vinculado a este setor." # type: ignore
        
        assert SectorUser.objects.filter(sector=sector).count() == initial_link_count

    def test_add_user_missing_email_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """Tests if sending no email in the payload returns 400.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None"""
        owner = scenario_data["owner"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=owner)
        url = reverse("adicionar-usuario-setor", kwargs={'pk': sector.pk})
        payload = {}

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400 # type: ignore
        assert response.data['sucesso'] is False # type: ignore