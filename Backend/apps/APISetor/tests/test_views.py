import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework.response import Response as DRFResponse
from typing import Dict, Any

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

        response = api_client.post(url, valid_payload, format="json") #type: ignore

        assert response.status_code == 201 # type: ignore
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

        response = api_client.post(url, payload, format="json")  #type: ignore

        assert response.status_code == 403 # type: ignore
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

    
        response = api_client.post(url, invalid_payload, format="json") #type: ignore
        
        assert response.status_code == 400 # type: ignore
        assert response.data['sucesso'] is False #type: ignore
        assert "Um setor com este nome já existe nesta empresa" in str(response.data) # type: ignore


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

        response = api_client.get(url)  #type: ignore

        assert response.status_code == 200 # type: ignore
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

        response = api_client.get(url) #type: ignore

        assert response.status_code == 200 # type: ignore
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

        response = api_client.get(url)  #type: ignore

        assert response.status_code == 404 # type: ignore
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

        response = api_client.get(url)  #type: ignore

        assert response.status_code == 401 # type: ignore
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

        response = api_client.get(url)  #type: ignore

        assert response.status_code == 403 # type: ignore
        assert response.data['sucesso'] is False  #type: ignore
        assert "Você não tem permissão para acessar este setor" in response.data['mensagem'] #type: ignore
    
@pytest.mark.django_db
class TestListUserSectorsAPI:
    """
    Test suite for the ListUserSectorsView endpoint (/visualizar/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Creates a scenario where 'test_user' has various roles:
        - Owns 'Owned Enterprise'.
        - Manages 'Managed Sector' in another enterprise.
        - Is Admin in 'Admin Sector'.
        - Is Member in 'Member Sector Active' and 'Member Sector Inactive'.
        - Has no link to 'Unrelated Sector'.
        """
        test_user = User.objects.create_user(username="multi_role_user", password="pw", email="multi@e.com", name="Multi Role")
        other_owner = User.objects.create_user(username="other_owner", password="pw", email="other@e.com", name="Other Owner")

        owned_enterprise = Enterprise.objects.create(name="Owned Enterprise", owner=test_user)
        owned_sector1 = Sector.objects.create(name="Owned Sector 1", enterprise=owned_enterprise, manager=test_user)
        owned_sector2 = Sector.objects.create(name="Owned Sector 2", enterprise=owned_enterprise, manager=other_owner) # Managed by someone else

        other_enterprise = Enterprise.objects.create(name="Other Enterprise", owner=other_owner)
        
        managed_sector = Sector.objects.create(name="Managed Sector", enterprise=other_enterprise, manager=test_user)

        admin_sector = Sector.objects.create(name="Admin Sector", enterprise=other_enterprise, manager=other_owner)
        SectorUser.objects.create(user=test_user, sector=admin_sector, is_adm=True)

        member_sector_active = Sector.objects.create(name="Member Sector Active", enterprise=other_enterprise, manager=other_owner, is_active=True)
        member_sector_inactive = Sector.objects.create(name="Member Sector Inactive", enterprise=other_enterprise, manager=other_owner, is_active=False)
        SectorUser.objects.create(user=test_user, sector=member_sector_active, is_adm=False)
        SectorUser.objects.create(user=test_user, sector=member_sector_inactive, is_adm=False)

        unrelated_sector = Sector.objects.create(name="Unrelated Sector", enterprise=other_enterprise, manager=other_owner)


        return {
            "test_user": test_user,
            "owned_enterprise": owned_enterprise,
            "owned_sector1": owned_sector1,
            "owned_sector2": owned_sector2,
            "managed_sector": managed_sector,
            "admin_sector": admin_sector,
            "member_sector_active": member_sector_active,
            "member_sector_inactive": member_sector_inactive,
            "unrelated_sector": unrelated_sector,
        }

    # Sucess

    def test_list_user_sectors_success(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Tests if the view returns all linked sectors with correct hierarchy levels.

        Args:
            self: The test instance.
            api_client (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
        
        Return:
            None
        """
        test_user: User = scenario_data["test_user"] # type: ignore
        api_client.force_authenticate(user=test_user)
        url: str = reverse("listar-setores") 

        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        
        returned_data = response.data['data'] # type: ignore
        
        assert len(returned_data) == 6 

        results = {item['name']: item['hierarchy_level'] for item in returned_data}

        assert results.get("Owned Sector 1") == "Proprietário"
        assert results.get("Owned Sector 2") == "Proprietário"
        assert results.get("Managed Sector") == "Gestor"
        assert results.get("Admin Sector") == "Administrador"
        assert results.get("Member Sector Active") == "Membro"
        assert results.get("Member Sector Inactive") == "Membro"

    def test_list_user_sectors_no_links_success(self, api_client: APIClient) -> None:
        """
        Tests if a user with no links to any sectors gets an empty list.
        
        Args:
            self: The test instance.
            api_client (APIClient) : api client for log in use
        
        Return:
            None
        """
        no_link_user = User.objects.create_user(username="no_link_user", password="pw", email="nolink@e.com", name="No Link")
        api_client.force_authenticate(user=no_link_user)
        url: str = reverse("listar-setores")

        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert "data" not in response.data # type: ignore

    # Fail

    def test_list_user_sectors_anonymous_fails(self, api_client: APIClient) -> None:
        """
        Tests if an unauthenticated user receives 401 Unauthorized.

        Args:
            self: The test instance.
            api_client (APIClient) : api client for log in use
        
        Return:
            None
        """
        url: str = reverse("listar-setores")

        response = api_client.get(url)

        assert response.status_code == 401 # type: ignore
        assert response.data['sucesso'] is False # type: ignore

@pytest.mark.django_db
class TestActivateDeactivateSectorAPI:
    """
    Test suite for the Activate/Deactivate Sector endpoint.
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict:
        """
        Creates a scenario with an owner, an outsider, and a sector.
        """
        owner = User.objects.create_user(username="toggle_owner", password="pw", name="Owner", email="owner@gmail.com")
        outsider = User.objects.create_user(username="toggle_outsider", password="pw", name="Outsider", email='outsider@gmail.com')
        enterprise = Enterprise.objects.create(name="Toggle Corp", owner=owner)
        # Start with an active sector
        sector = Sector.objects.create(name="Active Sector", enterprise=enterprise, manager=owner, is_active=True)

        return {
            "owner": owner,
            "outsider": outsider,
            "enterprise": enterprise,
            "sector": sector,
        }

    # Success

    def test_toggle_sector_by_owner_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if the enterprise owner can successfully deactivate an active sector.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data["owner"]
        sector = scenario_data["sector"]
        
        assert sector.is_active is True 
        
        api_client.force_authenticate(user=owner)
        url = reverse("ativar-desativar-setor", kwargs={'pk': sector.pk})

        response = api_client.put(url)

        assert response.status_code == 200 #type: ignore # type: ignore
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['data']['is_active'] is False #type: ignore
        
        sector.refresh_from_db()
        assert sector.is_active is False

        response_reactivate = api_client.put(url)

        assert response_reactivate.status_code == 200 #type: ignore
        assert response_reactivate.data['data']['is_active'] is True #type: ignore
        
        sector.refresh_from_db()
        
        assert sector.is_active is True


    # Failures

    def test_toggle_sector_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an unauthenticated user receives a 401 Unauthorized error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        sector = scenario_data["sector"]
        url = reverse("ativar-desativar-setor", kwargs={'pk': sector.pk})

        response = api_client.put(url)

        assert response.status_code == 401 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    def test_toggle_sector_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an authenticated but non-owner user receives a 403 Forbidden error.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        outsider = scenario_data["outsider"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=outsider)
        url = reverse("ativar-desativar-setor", kwargs={'pk': sector.pk})

        response = api_client.put(url)

        assert response.status_code == 403 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore
        assert "Você não tem permissão para modificar este setor" in str(response.data) #type: ignore

    def test_toggle_non_existent_sector_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if trying to toggle a non-existent sector returns a 404 Not Found error.
        
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
        url = reverse("ativar-desativar-setor", kwargs={'pk': non_existent_pk})

        response = api_client.put(url)

        assert response.status_code == 404 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

@pytest.mark.django_db
class TestEditSectorAPI:
    """
    Test suite for the Edit Sector endpoint (PUT /alterar/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict:
        """
        Creates a scenario with users, enterprise, and sector for edit tests.
        Roles: owner, manager, admin_worker, worker, outsider.
        """
        owner = User.objects.create_user(username="edit_owner", password="pw", name="Owner", email="owner@gmail.com")
        manager = User.objects.create_user(username="edit_manager", password="pw", name="Manager", email="manager@gmail.com")
        admin_worker = User.objects.create_user(username="edit_admin", password="pw", name="Admin", email="adm@gmail.com")
        worker = User.objects.create_user(username="edit_worker", password="pw", name="Worker", email="worker@gmail.com")
        outsider = User.objects.create_user(username="edit_outsider", password="pw", name="Outsider", email="outsider@gmail.com")

        enterprise = Enterprise.objects.create(name="Edit Corp", owner=owner)
        sector_to_edit = Sector.objects.create(
            name="Original Name", 
            enterprise=enterprise, 
            manager=manager, # Manager is assigned here
            image="original.png"
        )

        SectorUser.objects.create(user=admin_worker, sector=sector_to_edit, is_adm=True)
        SectorUser.objects.create(user=worker, sector=sector_to_edit, is_adm=False)

        return {
            "owner": owner,
            "manager": manager,
            "admin_worker": admin_worker,
            "worker": worker,
            "outsider": outsider,
            "enterprise": enterprise,
            "sector": sector_to_edit,
        }

    # Success

    @pytest.mark.parametrize("role", ["owner", "manager", "admin_worker"])
    def test_edit_sector_by_authorized_user_success(
        self, api_client: APIClient, scenario_data: Dict, role: str
    ) -> None:
        """
        Tests if authorized users (owner, manager, admin) can successfully edit the sector.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            roles: (str): Possible user roles
            
        Return:
            None
        """
        user = scenario_data[role]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=user)
        url = reverse("atualizar-setor", kwargs={'pk': sector.pk})
        
        payload = {
            "name": f"Updated by {role}",
            "image": "updated.png"
        }
        
        response = api_client.put(url, payload, format="json")

        assert response.status_code == 200 #type: ignore # type: ignore
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['mensagem'] == "Setor Atualizado!" #type: ignore
        assert response.data['data']['name'] == f"Updated by {role}" #type: ignore
        
        sector.refresh_from_db()
        
        assert sector.name == f"Updated by {role}"
        assert sector.image == "updated.png"

    def test_edit_sector_partial_update_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an authorized user can partially update (only one field) the sector.
        
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
        url = reverse("atualizar-setor", kwargs={'pk': sector.pk})
        
        payload = { "name": "Partially Updated Name" }
        original_image = sector.image 

        response = api_client.put(url, payload, format="json")

        assert response.status_code == 200 #type: ignore # type: ignore
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['data']['name'] == "Partially Updated Name" #type: ignore
        
        sector.refresh_from_db()
        
        assert sector.name == "Partially Updated Name"
        assert sector.image == original_image


    # Failures

    def test_edit_non_existent_sector_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if trying to edit a non-existent sector returns 404 Not Found.
        
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
        url = reverse("atualizar-setor", kwargs={'pk': non_existent_pk})
        payload = {"name": "Wont Update"}

        response = api_client.put(url, payload, format="json")

        assert response.status_code == 404 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    def test_edit_sector_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an unauthenticated user receives 401 Unauthorized.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        sector = scenario_data["sector"]
        url = reverse("atualizar-setor", kwargs={'pk': sector.pk})
        payload = {"name": "Wont Update"}

        response = api_client.put(url, payload, format="json")

        assert response.status_code == 401 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    @pytest.mark.parametrize("role", ["worker", "outsider"])
    def test_edit_sector_by_unauthorized_user_fails(
        self, api_client: APIClient, scenario_data: Dict, role: str
    ) -> None:
        """
        Tests if unauthorized users (worker, outsider) receive 403 Forbidden.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            role (str) : two types of unauthorized users
            
        Return:
            None
        """
        user = scenario_data[role]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=user)
        url = reverse("atualizar-setor", kwargs={'pk': sector.pk})
        payload = {"name": f"Attempt by {role}"}

        response = api_client.put(url, payload, format="json")

        assert response.status_code == 403 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    def test_edit_sector_with_invalid_data_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if sending invalid data (e.g., name too long) returns 400 Bad Request.
        
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
        url = reverse("atualizar-setor", kwargs={'pk': sector.pk})
        
        invalid_payload = { "name": "a" * 201 } 

        response = api_client.put(url, invalid_payload, format="json")

        assert response.status_code == 400 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore
        
@pytest.mark.django_db
class TestExcludeSectorAPI:
    """
    Test suite for the Exclude Sector endpoint (DELETE /excluir/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict:
        """
        Creates a scenario with an owner, an outsider, and a sector to delete.
        """
        owner = User.objects.create_user(username="delete_owner", password="pw", name="Owner", email="owner@gmail.com")
        outsider = User.objects.create_user(username="delete_outsider", password="pw", name="Outsider", email="outsider@gmail.com")
        enterprise = Enterprise.objects.create(name="Delete Corp", owner=owner)
        sector_to_delete = Sector.objects.create(
            name="Sector To Delete",
            enterprise=enterprise,
            manager=owner
        )

        return {
            "owner": owner,
            "outsider": outsider,
            "enterprise": enterprise,
            "sector": sector_to_delete,
        }

    # Success

    def test_delete_sector_by_owner_success(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if the enterprise owner can successfully delete the sector.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data["owner"]
        sector = scenario_data["sector"]
        sector_pk = sector.pk
        sector_name = sector.name
        api_client.force_authenticate(user=owner)
        url = reverse("deletar-setor", kwargs={'pk': sector_pk})

        response = api_client.delete(url)

        assert response.status_code == 200 #type: ignore # type: ignore
        assert response.data['sucesso'] is True #type: ignore
        assert response.data['mensagem'] == f"Setor {sector_name} deletado com sucesso." #type: ignore

        assert not Sector.objects.filter(pk=sector_pk).exists()

    # Failures

    def test_delete_non_existent_sector_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if trying to delete a non-existent sector returns 404 Not Found.
        
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
        url = reverse("deletar-setor", kwargs={'pk': non_existent_pk})

        response = api_client.delete(url)

        assert response.status_code == 404 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    def test_delete_sector_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an unauthenticated user receives 401 Unauthorized.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        sector = scenario_data["sector"]
        url = reverse("deletar-setor", kwargs={'pk': sector.pk})
        
        response = api_client.delete(url)

        assert response.status_code == 401 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore

    def test_delete_sector_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict) -> None:
        """
        Tests if an authenticated but unauthorized user (not the owner) receives 403 Forbidden.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        outsider = scenario_data["outsider"]
        sector = scenario_data["sector"]
        api_client.force_authenticate(user=outsider)
        url = reverse("deletar-setor", kwargs={'pk': sector.pk})

        response = api_client.delete(url)

        assert response.status_code == 403 #type: ignore # type: ignore
        assert response.data['sucesso'] is False #type: ignore