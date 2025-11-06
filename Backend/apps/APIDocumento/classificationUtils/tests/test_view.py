import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Dict, Any

from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Document, Classification, Category, Classification_Status, Classification_Privacity

User = get_user_model()

@pytest.mark.django_db
class TestRetrieveClassificationAPI:
    """
    Suíte de testes para o endpoint RetrieveClassificationView (/classificacao/consultar/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, um documento com classificação
        e um documento sem classificação.
        """
        test_user = User.objects.create_user(username="class_user", password="pw", email="class@e.com", name="Class User")
        owner = User.objects.create_user(username="class_owner", password="pw", email="class_owner@e.com", name="Class Owner")

        enterprise = Enterprise.objects.create(name="Class Corp", owner=owner)
        sector = Sector.objects.create(name="Class Sector", enterprise=enterprise, manager=owner)

        # Dados Padrão (necessários para criar a Classificação)
        status_padrao, _ = Classification_Status.objects.get_or_create(status="Em andamento")
        privacidade_padrao, _ = Classification_Privacity.objects.get_or_create(privacity="Privado")

        # Documento 1: Completo (com Classificação)
        doc_com_class = Document.objects.create(
            title="Doc Com Classificação",
            content={},
            creator=test_user,
            sector=sector
        )
        classificacao = Classification.objects.create(
            document=doc_com_class,
            classification_status=status_padrao,
            privacity=privacidade_padrao,
            reviewer=owner
        )

        # Documento 2: Sem Classificação
        doc_sem_class = Document.objects.create(
            title="Doc Sem Classificação",
            content={},
            creator=test_user,
            sector=sector
        )

        return {
            "test_user": test_user,
            "owner": owner,
            "doc_with_classification": doc_com_class,
            "classification_obj": classificacao,
            "doc_without_classification": doc_sem_class,
        }

    # Success

    def test_retrieve_classification_success(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador autenticado pode recuperar com sucesso
        a classificação de um documento válido.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        test_user: User = scenario_data["test_user"] # type: ignore
        doc: Document = scenario_data["doc_with_classification"] # type: ignore
        class_obj: Classification = scenario_data["classification_obj"] # type: ignore
        
        api_client.force_authenticate(user=test_user)
        url: str = reverse("visualizar-classificacao", kwargs={'pk': doc.pk})

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['classification_id'] == class_obj.pk # type: ignore
        assert response.data['data']['document'] == doc.pk # type: ignore
        assert response.data['data']['reviewer'] == scenario_data["owner"].name # type: ignore
        assert response.data['data']['classification_status']['status'] == "Em andamento" # type: ignore

    # Failures

    def test_retrieve_classification_doc_not_found_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se requisitar um 'pk' de Documento que não existe retorna 404.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        test_user: User = scenario_data["test_user"] # type: ignore
        api_client.force_authenticate(user=test_user)
        non_existent_pk: int = 999
        url: str = reverse("visualizar-classificacao", kwargs={'pk': non_existent_pk})

        response = api_client.get(url)
                
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore
        assert response.data['mensagem'] == "Recurso não encontrado." # type: ignore

    def test_retrieve_classification_missing_classification_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se requisitar um Documento que existe mas não tem Classificação retorna 404.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        test_user: User = scenario_data["test_user"] # type: ignore
        doc_sem_class: Document = scenario_data["doc_without_classification"] # type: ignore
        api_client.force_authenticate(user=test_user)
        url: str = reverse("visualizar-classificacao", kwargs={'pk': doc_sem_class.pk})

        response = api_client.get(url)
                
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore
        assert "Recurso não encontrado." in response.data['mensagem'] # type: ignore

    def test_retrieve_classification_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        doc: Document = scenario_data["doc_with_classification"] # type: ignore
        url: str = reverse("visualizar-classificacao", kwargs={'pk': doc.pk})

        response = api_client.get(url)

        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore