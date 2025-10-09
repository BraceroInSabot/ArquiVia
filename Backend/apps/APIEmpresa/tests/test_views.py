from typing import Dict, List
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from rest_framework.request import Request as DRFRequest
from pytest_mock import MockerFixture # type: ignore
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
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
            
        response: DRFResponse = client.get(url_retrieve, format="json") #type: ignore
        
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
        
@pytest.mark.django_db
class TestListEnterpriseAPI:
    # Background
    
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
        # 1. Criar os 5 usuários
        owner1 = User.objects.create_user(username="owner1", password="pw", name="Owner 1", email="owner1@e.com")
        manager = User.objects.create_user(username="manager", password="pw", name="Manager", email="manager@e.com")
        worker = User.objects.create_user(username="worker", password="pw", name="Worker", email="worker@e.com")
        admin_worker = User.objects.create_user(username="admin_worker", password="pw", name="Admin Worker", email="adminworker@e.com")
        owner2 = User.objects.create_user(username="owner2", password="pw", name="Owner 2", email="owner2@e.com")

        # 2. Criar as empresas
        enterprise1 = Enterprise.objects.create(name="Empresa do Dono 1", owner=owner1)
        # Dono 1 também é dono de uma segunda empresa
        enterprise2 = Enterprise.objects.create(name="Outra Empresa do Dono 1", owner=owner1)
        # Dono 2 tem sua própria empresa
        enterprise3 = Enterprise.objects.create(name="Empresa do Dono 2", owner=owner2)

        # 3. Criar o setor e vincular à empresa e ao gestor
        sector1 = Sector.objects.create(name="Setor Principal", enterprise=enterprise1, manager=manager)

        # 4. Vincular os colaboradores ao setor
        SectorUser.objects.create(user=worker, sector=sector1, is_adm=False)
        SectorUser.objects.create(user=admin_worker, sector=sector1, is_adm=True)

        # 5. Retornar todos os objetos criados para que os testes possam usá-los
        return {
            "owner1": owner1,
            "manager": manager,
            "worker": worker,
            "admin_worker": admin_worker,
            "owner2": owner2,
            "enterprise1": enterprise1,
            "enterprise2": enterprise2,
            "enterprise3": enterprise3,
        }
    
    # Success
    
    def test_visibility_for_owner_success(self, api_client, scenario_data: Dict[str, object]):
        """
        Test if owner can only see enterprises wich are only yours.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        url = reverse("visualizar-empresas")
        api_client.force_authenticate(user=scenario_data["owner1"])

        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data['data']) == 2 
        
        enterprise_names = {item['name'] for item in response.data['data']}
        
        assert "Empresa do Dono 1" in enterprise_names
        assert "Outra Empresa do Dono 1" in enterprise_names
        assert "Empresa do Dono 2" not in enterprise_names 

    def test_visibility_for_sector_manager_success(self, api_client, scenario_data: Dict[str, object]):
        """
        Test if manager can see enterprises wich he is linked.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        url = reverse("visualizar-empresas")
        api_client.force_authenticate(user=scenario_data["manager"])

        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data['data']) == 1
        assert response.data['data'][0]['name'] == "Empresa do Dono 1"

    def test_visibility_for_sector_worker_success(self, api_client, scenario_data: Dict[str, object]):
        """
        Test if worker can see the enterprise wich he is linked.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        url = reverse("visualizar-empresas")
        api_client.force_authenticate(user=scenario_data["worker"])

        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data['data']) == 1
        assert response.data['data'][0]['name'] == "Empresa do Dono 1"

    def test_visibility_for_outsider_owner_success(self, api_client, scenario_data: Dict[str, object]):
        """
        Test if 2º owner can see only his enterprise.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        url = reverse("visualizar-empresas")
        api_client.force_authenticate(user=scenario_data["owner2"])

        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data['data']) == 1
        assert response.data['data'][0]['name'] == "Empresa do Dono 2" 

@pytest.mark.django_db
class TestEditEnterpriseAPI:
    # Backgroud
    
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
        # 1. Criar os 5 usuários
        owner1 = User.objects.create_user(username="owner1", password="pw", name="Owner 1", email="owner1@e.com")
        manager = User.objects.create_user(username="manager", password="pw", name="Manager", email="manager@e.com")
        worker = User.objects.create_user(username="worker", password="pw", name="Worker", email="worker@e.com")
        admin_worker = User.objects.create_user(username="admin_worker", password="pw", name="Admin Worker", email="adminworker@e.com")
        owner2 = User.objects.create_user(username="owner2", password="pw", name="Owner 2", email="owner2@e.com")

        # 2. Criar as empresas
        enterprise1 = Enterprise.objects.create(name="Empresa do Dono 1", owner=owner1)
        # Empresa Dono 2
        enterprise2 = Enterprise.objects.create(name="Empresa do Dono 2", owner=owner2)

        # 3. Criar o setor e vincular à empresa e ao gestor
        sector1 = Sector.objects.create(name="Setor Principal", enterprise=enterprise1, manager=manager)

        # 4. Vincular os colaboradores ao setor
        SectorUser.objects.create(user=worker, sector=sector1, is_adm=False)
        SectorUser.objects.create(user=admin_worker, sector=sector1, is_adm=True)

        # 5. Retornar todos os objetos criados para que os testes possam usá-los
        return {
            "owner1": owner1,
            "manager": manager,
            "worker": worker,
            "admin_worker": admin_worker,
            "owner2": owner2,
            "enterprise1": enterprise1,
            "enterprise2": enterprise2,
        }
        
    # Success
    
    def test_edit_enterprise_by_owner_success(self, api_client: APIClient, scenario_data: dict) -> None:
        owner = scenario_data["owner1"]
        enterprise_to_edit = scenario_data["enterprise1"]
        api_client.force_authenticate(user=owner)
        
        url = reverse("alterar-empresa", kwargs={'pk': enterprise_to_edit.pk})
        
        valid_payload = {
            "name": "Novo Nome da Empresa",
            "image": "novo_logo.png"
        }

        response = api_client.put(url, valid_payload, format="json")

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        
        enterprise_to_edit.refresh_from_db()
        assert enterprise_to_edit.name == "Novo Nome da Empresa"

    # Failures
    
    def test_edit_enterprise_by_anonymous_fails(self, api_client: APIClient, scenario_data: dict) -> None:
        enterprise_to_edit = scenario_data["enterprise1"]
        url = reverse("alterar-empresa", kwargs={'pk': enterprise_to_edit.pk})
        payload = {"name": "Tentativa de Edição"}

        response = api_client.put(url, payload, format="json")

        assert response.status_code == 401 # type: ignore
        assert response.data['mensagem'] == 'As credenciais de autenticação não foram fornecidas.' # type: ignore

    @pytest.mark.parametrize("role", ["manager", "worker", "admin_worker"])
    def test_edit_enterprise_by_non_owner_roles_fails(self, api_client: APIClient, scenario_data: dict, role: str) -> None:
        user = scenario_data[role]
        enterprise_to_edit = scenario_data["enterprise1"]
        api_client.force_authenticate(user=user)
        
        url = reverse("alterar-empresa", kwargs={'pk': enterprise_to_edit.pk})
        payload = {"name": f"Tentativa de Edição por {role}"}
        
        response = api_client.put(url, payload, format="json")

        assert response.status_code == 403 # type: ignore
        assert response.data['sucesso'] == False # type: ignore

    def test_edit_enterprise_with_invalid_data_type_fails(self, api_client: APIClient, scenario_data: dict) -> None:
        owner = scenario_data["owner1"]
        enterprise_to_edit = scenario_data["enterprise1"]
        api_client.force_authenticate(user=owner)

        url = reverse("alterar-empresa", kwargs={'pk': enterprise_to_edit.pk})
        
        invalid_payload = {
            "name": "123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789",
            "image": "logo.png"
        }

        response = api_client.put(url, invalid_payload, format="json")

        assert response.status_code == 400 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
        assert "Dados inválidos" in str(response.data['mensagem']) # type: ignore
        
    def test_edit_enterprise_not_exist_fails(self, api_client: APIClient, scenario_data: dict):
        owner = scenario_data['owner1']
        api_client.force_authenticate(user=owner)

        url = reverse("alterar-empresa", kwargs={'pk': 500})
        
        invalid_payload = {
            "name": "Não atualiza por favor",
            "image": "logo.png"
        }

        response = api_client.put(url, invalid_payload, format="json")

        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
        
    def test_edit_enterprise_with_broken_operation_fails(self, api_client: APIClient, scenario_data: dict, mocker: MockerFixture):
        owner = scenario_data['owner1']
        enterprise_to_edit = scenario_data['enterprise1']
        
        api_client.force_authenticate(user=owner)
        
        invalid_payload = {
            "name": "Não atualiza por favor",
            "image": "logo.png"
        }
        
        url = reverse("alterar-empresa", kwargs={'pk': enterprise_to_edit.enterprise_id})
        
        mocked_get = mocker.patch(
            'apps.APIEmpresa.views.Enterprise.objects.get',
            side_effect=Exception("Simulated Database Query Error")
        )


        response = api_client.put(url, invalid_payload, format="json")

        assert response.status_code == 500 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
    
@pytest.mark.django_db    
class TestActivateOrDeactivateAPI:
    # Backgroud
    
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
        Create a scenario where one owner have access to a activated and deactivade enterprise and another owner have only one activated enterprise.
        
        Args:
            self: The test instance.

        Returns:
            None
        """
        # 1. Criar os 2 usuários
        owner1 = User.objects.create_user(username="owner1", password="pw", name="Owner 1", email="owner1@e.com")
        owner2 = User.objects.create_user(username="owner2", password="pw", name="Owner 2", email="owner2@e.com")

        # 2. Criar as empresas
        enterprise1 = Enterprise.objects.create(name="Empresa do Dono 1", owner=owner1, is_active=False)
        enterprise2 = Enterprise.objects.create(name="Outra Empresa do Dono 1", owner=owner1, is_active=True)
        # Empresa Dono 2
        enterprise3 = Enterprise.objects.create(name="Empresa do Dono 2", owner=owner2)

        return {
            "owner1": owner1,
            "owner2": owner2,
            "enterprise1": enterprise1,
            "enterprise2": enterprise2,
            "enterprise3": enterprise3
        }
    
    # Success
     
    def test_activate_deactivate_enterprise_success(self, api_client: APIClient, scenario_data: dict):
        """
        Test if the user can deactivate a active enterprise normally.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        # Deactivate
        
        owner = scenario_data['owner1']
        enterprise_activated = scenario_data['enterprise2']
        
        api_client.force_authenticate(user=owner)
        
        url = reverse("ativar-desativar-empresa", kwargs={'pk': enterprise_activated.enterprise_id})

        response = api_client.put(url, format="json")
        
        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] == True # type: ignore
        enterprise_activated.refresh_from_db()
        assert not enterprise_activated.is_active
        
        # Activated
        
        enterprise_deactivated = scenario_data['enterprise2']
        
        url = reverse("ativar-desativar-empresa", kwargs={'pk': enterprise_deactivated.enterprise_id})
        
        response = api_client.put(url, format='json')
        
        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] == True # type: ignore
        enterprise_activated.refresh_from_db()
        assert enterprise_activated.is_active
    
    # Failures
    
    def test_deactivate_wrong_enterprise_fails(self, api_client: APIClient, scenario_data: dict):
        """
        Test if the user inform a invalid pk to URL.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data['owner1']
        enterprise_activated = scenario_data['enterprise1']
        
        api_client.force_authenticate(user=owner)
        
        url = reverse("ativar-desativar-empresa", kwargs={'pk': 540})

        response = api_client.put(url, format="json")
        
        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
        assert not enterprise_activated.is_active        
        
    def test_deactivate_non_owner_enterprise_fails(self, api_client: APIClient, scenario_data: dict):
        """
        Test if the user wich isnt owner of determined enterprise cannot change its status.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner2 = scenario_data['owner2']
        enterprise_activated = scenario_data["enterprise2"]
        
        api_client.force_authenticate(user=owner2)
        
        url = reverse("ativar-desativar-empresa", kwargs={'pk': enterprise_activated.enterprise_id})

        response = api_client.put(url, format="json")
        
        assert response.status_code == 404 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
        assert enterprise_activated.is_active
        
    def test_broken_operation_on_deactivation_process_fails(self, api_client: APIClient, mocker: MockerFixture, scenario_data: dict):
        """
        Test the return of the application when something gone wrong during operation process.
        
        Args:
            self: The test instance.
            api_cliente (APIClient) : api client for log in use
            mocker (MockerFixture): intend to be a failure on a determinated method
            scenario_data (Dict[str, object]) : scenario for simulate a determinated environment
            
        Return:
            None
        """
        owner = scenario_data['owner1']
        enterprise_activated = scenario_data["enterprise2"]
        
        api_client.force_authenticate(user=owner)
        
        mocked_get = mocker.patch(
            'apps.APIEmpresa.views.Enterprise.save',
            side_effect=Exception("Simulated Database Query Error")
        )
        
        url = reverse("ativar-desativar-empresa", kwargs={'pk': enterprise_activated.enterprise_id})

        response = api_client.put(url, format="json")
        
        assert response.status_code == 400 # type: ignore
        assert response.data['sucesso'] == False # type: ignore
        assert enterprise_activated.is_active
        
        