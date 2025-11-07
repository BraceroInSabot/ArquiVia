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