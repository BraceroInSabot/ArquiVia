import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Dict, Any, List

from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Document, Classification, Category, Classification_Status, Classification_Privacity

User = get_user_model()

@pytest.mark.django_db
class TestCreateDocumentAPI:
    """
    Suíte de testes para o endpoint CreateDocumentView (/criar-documento/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, empresa, setor e vínculos com diferentes papéis.
        Papéis: owner, manager, member, outsider.
        """
        owner = User.objects.create_user(username="doc_owner", password="pw", email="doc_owner@e.com", name="Doc Owner")
        manager = User.objects.create_user(username="doc_manager", password="pw", email="doc_manager@e.com", name="Doc Manager")
        member = User.objects.create_user(username="doc_member", password="pw", email="doc_member@e.com", name="Doc Member")
        outsider = User.objects.create_user(username="doc_outsider", password="pw", email="doc_outsider@e.com", name="Doc Outsider")

        enterprise = Enterprise.objects.create(name="Doc Corp", owner=owner)
        
        # O manager (gestor) gerencia este setor
        sector = Sector.objects.create(name="Doc Sector", enterprise=enterprise, manager=manager)
        
        # O member (membro) está vinculado a este setor
        SectorUser.objects.create(user=member, sector=sector)
        
        # O owner também está vinculado ao seu próprio setor (para testes de permissão)
        SectorUser.objects.create(user=owner, sector=sector, is_adm=True)

        # Categorias para o ManyToMany
        category1 = Category.objects.create(category="Contrato", category_enterprise=enterprise)
        category2 = Category.objects.create(category="Importante", category_enterprise=enterprise)

        # Dados padrão de classificação (essenciais para o .create() do serializer)
        status_padrao = Classification_Status.objects.create(status="Concluído", status_id=1)
        status_padrao = Classification_Status.objects.create(status="Em Andamento", status_id=2)
        status_padrao = Classification_Status.objects.create(status="Revisão necessária", status_id=3)
        status_padrao = Classification_Status.objects.create(status="Arquivado", status_id=4)
        
        privacidade_padrao = Classification_Privacity.objects.create(privacity="Público", classification_privacity_id=1)
        privacidade_padrao = Classification_Privacity.objects.create(privacity="Privado", classification_privacity_id=2)

        return {
            "owner": owner,
            "manager": manager,
            "member": member,
            "outsider": outsider,
            "sector": sector,
            "category1": category1,
            "category2": category2,
            "status_padrao": status_padrao,
            "privacidade_padrao": privacidade_padrao,
        }

    # Success

    @pytest.mark.parametrize("role", ["owner", "manager", "member"])
    def test_create_document_by_authorized_user_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any], role: str
    ) -> None:
        """
        Testa se utilizadores autorizados (owner, manager, member) podem criar um documento.

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
        category1: Category = scenario_data["category1"] # type: ignore
        category2: Category = scenario_data["category2"] # type: ignore
        
        api_client.force_authenticate(user=actor)
        url: str = reverse("criar-documento")
        
        payload: Dict[str, Any] = {
            "content": {"ops": [{"insert": "Este é o conteúdo."}]},
            "sector": sector.pk,
            "categories": [] if role == "outsider" else [category1.category_id, category2.category_id],
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 201 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        
        doc_id = response.data['data']['document_id'] # type: ignore
        assert Document.objects.filter(pk=doc_id).exists()
        new_doc: Document = Document.objects.get(pk=doc_id) # type: ignore
        assert new_doc.creator == actor
        assert new_doc.sector == sector
        assert Classification.objects.filter(document=new_doc).exists()

    # Failures

    def test_create_document_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador autenticado mas não vinculado ao setor (outsider) recebe um erro 400 (de permissão do serializer).

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
        url: str = reverse("criar-documento")
        payload: Dict[str, Any] = {
            "content": {},
            "sector": sector.pk,
            "categories": [],
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400 #type: ignore
        assert response.data['sucesso'] is False # type: ignore
        assert "Você não tem permissão para criar documentos neste setor." in str(response.data) # type: ignore

    def test_create_document_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
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
        url: str = reverse("criar-documento")
        payload: Dict[str, Any] = {
            "content": {},
            "sector": sector.pk,
            "categories": [],
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 401 #type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_create_document_missing_sector_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se a criação falha se o campo 'sector' estiver faltando (erro de validação).

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        owner: User = scenario_data["owner"] # type: ignore
        sector: Sector = scenario_data["sector"] # type: ignore
        api_client.force_authenticate(user=owner)
        url: str = reverse("criar-documento")
        payload: Dict[str, Any] = {
            "content": {},
            "categories": [],
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400 #type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_create_document_missing_defaults_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se a criação falha se os status/privacidade padrão não estiverem no banco (erro 400 do .create()).

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        Classification_Status.objects.all().delete()
        
        owner: User = scenario_data["owner"] # type: ignore
        sector: Sector = scenario_data["sector"] # type: ignore
        api_client.force_authenticate(user=owner)
        url: str = reverse("criar-documento")
        payload: Dict[str, Any] = {
            "content": {},
            "sector": sector.pk,
            "categories": [],
        }

        response = api_client.post(url, payload, format="json")

        assert response.status_code == 400  #type: ignore
        assert response.data['sucesso'] is False # type: ignore
        