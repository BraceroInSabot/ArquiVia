import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Dict, Any, List

# Importe os seus modelos
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Category

User = get_user_model()

@pytest.mark.django_db
class TestCreateCategoryAPI:
    """
    Suíte de testes para o endpoint CreateCategoryView (/criar-categoria/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, empresa, setor e vínculos.
        Papéis: owner, manager, member, outsider.
        """
        owner = User.objects.create_user(username="cat_owner", password="pw", email="cat_owner@e.com", name="Cat Owner")
        manager = User.objects.create_user(username="cat_manager", password="pw", email="cat_manager@e.com", name="Cat Manager")
        member = User.objects.create_user(username="cat_member", password="pw", email="cat_member@e.com", name="Cat Member")
        outsider = User.objects.create_user(username="cat_outsider", password="pw", email="cat_outsider@e.com", name="Cat Outsider")

        enterprise = Enterprise.objects.create(name="Category Corp", owner=owner)
        sector = Sector.objects.create(name="Category Sector", enterprise=enterprise, manager=manager)
        
        SectorUser.objects.create(user=member, sector=sector)

        return {
            "owner": owner,
            "manager": manager,
            "member": member,
            "outsider": outsider,
            "enterprise": enterprise,
            "sector": sector,
        }

    # Success

    @pytest.mark.parametrize("role", ["owner", "manager"])
    def test_create_category_by_authorized_user_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any], role: str
    ) -> None:
        """
        Testa se utilizadores autorizados (owner, manager) podem criar uma categoria.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
            role: (str): Possíveis papéis de utilizador
        
        Return:
            None
        """
        actor: User = scenario_data[role] # type: ignore
        sector: Sector = scenario_data["sector"] # type: ignore
        
        api_client.force_authenticate(user=actor)
        url: str = reverse("criar-categoria") # Assumindo o nome da URL
        
        payload: Dict[str, Any] = {
            "category": f"Categoria de Teste {role}",
            "description": "Uma descrição...",
            "category_sector": sector.pk,
            "is_public": False
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 201
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['mensagem'] == "Categoria criada com sucesso!" # type: ignore
        
        # Verificações de QA (Banco de Dados)
        cat_id = response.data['data']['category_id'] # type: ignore
        assert Category.objects.filter(pk=cat_id).exists()
        new_cat: Category = Category.objects.get(pk=cat_id) # type: ignore
        assert new_cat.category_enterprise == sector.enterprise # Verifica se a empresa foi definida corretamente
        
        
    def test_create_category_by_member(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se membros tem a autorização para criar categorias.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado

        Return:
            None
        """
        actor: User = scenario_data['member'] # type: ignore
        sector: Sector = scenario_data["sector"] # type: ignore
        
        api_client.force_authenticate(user=actor)
        url: str = reverse("criar-categoria") # Assumindo o nome da URL
        
        payload: Dict[str, Any] = {
            "category": f"Categoria de Teste para membro",
            "description": "Uma descrição...",
            "category_sector": sector.pk,
            "is_public": False
        }
        
        response = api_client.post(url, payload, format="json")
        
        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore

    # Failures

    def test_create_category_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador não vinculado ao setor (outsider) recebe um erro 400 (de permissão do serializer).

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        outsider: User = scenario_data["outsider"] # type: ignore
        sector: Sector = scenario_data["sector"] # type: ignore
        api_client.force_authenticate(user=outsider)
        url: str = reverse("criar-categoria")
        payload: Dict[str, Any] = {
            "category": "Categoria Falha",
            "category_sector": sector.pk,
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore
        assert "Dados inválidos" in response.data['mensagem'] # type: ignore

    def test_create_category_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        sector: Sector = scenario_data["sector"] # type: ignore
        url: str = reverse("criar-categoria")
        payload: Dict[str, Any] = {
            "category": "Categoria Anônima",
            "category_sector": sector.pk,
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore

    def test_create_category_missing_sector_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se a criação falha se 'category_sector' (obrigatório) estiver faltando.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        owner: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=owner)
        url: str = reverse("criar-categoria")
        payload: Dict[str, Any] = {
            "category": "Categoria Sem Setor",
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore
        assert "Dados inválidos" in response.data['mensagem'] # type: ignore
        assert "Este campo é obrigatório." in str(response.data['data']['category_sector']) # type: ignore
        
@pytest.mark.django_db
class TestListCategoryView:
    """
    Suíte de testes para o endpoint ListCategoryView (/categoria/visualizar/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, empresas e categorias
        para testar a lógica de visibilidade (público vs. privado-vinculado).
        """
        # --- Criar Utilizadores ---
        user_linked = User.objects.create_user(username="list_cat_linked", password="pw", email="linked@e.com", name="User Linked")
        user_unlinked = User.objects.create_user(username="list_cat_unlinked", password="pw", email="unlinked@e.com", name="User Unlinked")

        # --- Criar Empresas ---
        enterprise_linked = Enterprise.objects.create(name="Linked Corp", owner=user_linked)
        enterprise_unrelated = Enterprise.objects.create(name="Unrelated Corp", owner=user_unlinked)
        
        # --- Criar Categorias ---
        
        # Categoria 1: Privada e Vinculada (user_linked DEVE ver)
        category_private_linked = Category.objects.create(
            category="Privada Vinculada",
            category_enterprise=enterprise_linked,
            is_public=False
        )
        
        # Categoria 2: Pública (TODOS os utilizadores autenticados DEVEM ver)
        category_public = Category.objects.create(
            category="Pública",
            category_enterprise=enterprise_unrelated, 
            is_public=True
        )
        
        category_private_unrelated = Category.objects.create(
            category="Privada Não Vinculada",
            category_enterprise=enterprise_unrelated,
            is_public=False
        )

        return {
            "user_linked": user_linked,
            "user_unlinked": user_unlinked,
            "category_public": category_public,
            "category_private_linked": category_private_linked,
            "category_private_unrelated": category_private_unrelated,
        }

    # Success

    def test_list_categories_by_linked_user_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador vinculado vê as suas categorias privadas E as públicas.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_linked"] # type: ignore
        api_client.force_authenticate(user=user)
        url: str = reverse("listar-categorias") 

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        
        data_list: List[Dict[str, Any]] = response.data['data'] # type: ignore
        
        assert len(data_list) == 2

        returned_cat_ids = {item['category_id'] for item in data_list}

        assert scenario_data["category_private_linked"].pk in returned_cat_ids # type: ignore
        assert scenario_data["category_public"].pk in returned_cat_ids # type: ignore
        assert scenario_data["category_private_unrelated"].pk not in returned_cat_ids # type: ignore

    def test_list_categories_by_unlinked_user_sees_their_own_and_public_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador (que só tem vínculo com sua própria empresa)
        vê as suas categorias privadas E as categorias públicas.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_unlinked"] # type: ignore
        api_client.force_authenticate(user=user)
        url: str = reverse("listar-categorias")

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        
        data_list: List[Dict[str, Any]] = response.data['data'] # type: ignore

        assert len(data_list) == 2

        returned_cat_ids = {item['category_id'] for item in data_list}
        
        assert scenario_data["category_public"].pk in returned_cat_ids # type: ignore
        assert scenario_data["category_private_unrelated"].pk in returned_cat_ids # type: ignore
        
        assert scenario_data["category_private_linked"].pk not in returned_cat_ids # type: ignore

    # Failure

    def test_list_categories_by_anonymous_fails(self, api_client: APIClient) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
        
        Return:
            None
        """
        url: str = reverse("listar-categorias")

        response = api_client.get(url)

        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore