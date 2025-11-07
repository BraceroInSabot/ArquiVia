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
        classificacao = Classification.objects.create(
            classification_status=status_padrao,
            privacity=privacidade_padrao,
            reviewer=owner,
            is_reviewed=True
        )
        doc_com_class = Document.objects.create(
            title="Doc Com Classificação",
            content={},
            creator=test_user,
            sector=sector,
            classification=classificacao
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
        
@pytest.mark.django_db
class TestUpdateClassificationAPI:
    """
    Suíte de testes para o endpoint UpdateClassificationView (/alterar-classificacao/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, empresa, setor, um documento
        com classificação e um documento sem classificação.
        """
        owner = User.objects.create_user(username="update_class_owner", password="pw", email="update_class_owner@e.com", name="Update Class Owner")
        member = User.objects.create_user(username="update_class_member", password="pw", email="update_class_member@e.com", name="Update Class Member")
        outsider = User.objects.create_user(username="update_class_outsider", password="pw", email="update_class_outsider@e.com", name="Update Class Outsider")
        
        enterprise = Enterprise.objects.create(name="Update Class Corp", owner=owner)
        sector = Sector.objects.create(name="Update Class Sector", enterprise=enterprise, manager=owner)
        SectorUser.objects.create(user=member, sector=sector)

        # Dados Padrão (necessários para criar e atualizar)
        status_em_andamento, _ = Classification_Status.objects.get_or_create(status="Em andamento")
        status_concluido, _ = Classification_Status.objects.get_or_create(status="Concluído")
        privacidade_privado, _ = Classification_Privacity.objects.get_or_create(privacity="Privado")
        privacidade_publico, _ = Classification_Privacity.objects.get_or_create(privacity="Publico")

        # Documento 1: Completo (com Classificação)
        classification = Classification.objects.create(
            classification_status=status_em_andamento,
            privacity=privacidade_privado,
            reviewer=owner
        )
        doc_com_class = Document.objects.create(
            title="Doc Com Classificação", 
            content={}, 
            creator=member, 
            sector=sector,
            classification=classification)

        # Documento 2: Sem Classificação (para teste de 404)
        doc_sem_class = Document.objects.create(title="Doc Sem Classificação", content={}, creator=member, sector=sector)

        return {
            "owner": owner,
            "member": member,
            "outsider": outsider,
            "doc_with_classification": doc_com_class,
            "doc_without_classification": doc_sem_class,
            "status_concluido": status_concluido,
            "privacidade_publico": privacidade_publico,
            "new_reviewer": outsider, # Um usuário para ser o novo revisor
        }

    # --- Teste de Sucesso (200 OK) ---

    def test_update_classification_success(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador autorizado (ex: owner) pode atualizar 
        com sucesso todos os campos da classificação.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        owner: User = scenario_data["owner"] # type: ignore
        document: Document = scenario_data["doc_with_classification"] # type: ignore
        status_concluido: Classification_Status = scenario_data["status_concluido"] # type: ignore
        privacidade_publico: Classification_Privacity = scenario_data["privacidade_publico"] # type: ignore
        new_reviewer: User = scenario_data["new_reviewer"] # type: ignore

        api_client.force_authenticate(user=owner)
        url: str = reverse("alterar-classificacao", kwargs={'pk': document.pk})

        payload: Dict[str, Any] = {
            "is_reviewed": True,
            "classification_status": status_concluido.pk,
            "privacity": privacidade_publico.pk,
            "reviewer": new_reviewer.pk
        }

        response = api_client.patch(url, payload, format="json")

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        
        # Verificar dados no corpo da resposta
        response_data = response.data['data'] # type: ignore
        assert response_data['is_reviewed'] is True
        assert response_data['classification_status']['status'] == "Concluído" # type: ignore
        assert response_data['privacity']['privacity'] == "Publico" # type: ignore
        assert response_data['reviewer'] == new_reviewer.name # type: ignore

        # Verificação de QA no Banco
        document.classification.refresh_from_db()# type: ignore
        assert document.classification.is_reviewed is True# type: ignore
        assert document.classification.classification_status == status_concluido# type: ignore
        assert document.classification.privacity == privacidade_publico# type: ignore
        assert document.classification.reviewer == new_reviewer# type: ignore

    # --- Testes de Falha ---

    def test_update_classification_doc_not_found_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se requisitar um 'pk' de Documento que não existe retorna 404.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        owner: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=owner)
        non_existent_pk: int = 999
        url: str = reverse("alterar-classificacao", kwargs={'pk': non_existent_pk})
        payload: Dict[str, bool] = {"is_reviewed": True}

        response = api_client.patch(url, payload, format="json")
                
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore

    def test_update_classification_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        document: Document = scenario_data["doc_with_classification"] # type: ignore
        url: str = reverse("alterar-classificacao", kwargs={'pk': document.pk})
        payload: Dict[str, bool] = {"is_reviewed": True}

        response = api_client.patch(url, payload, format="json")

        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore

    def test_update_classification_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador autenticado mas não vinculado (outsider) recebe um erro 403.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        outsider: User = scenario_data["outsider"] # type: ignore
        document: Document = scenario_data["doc_with_classification"] # type: ignore
        api_client.force_authenticate(user=outsider)
        url: str = reverse("alterar-classificacao", kwargs={'pk': document.pk})
        payload: Dict[str, bool] = {"is_reviewed": True}

        response = api_client.patch(url, payload, format="json")

        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    def test_update_classification_invalid_data_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se enviar um ID de status que não existe retorna 400.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        owner: User = scenario_data["owner"] # type: ignore
        document: Document = scenario_data["doc_with_classification"] # type: ignore
        api_client.force_authenticate(user=owner)
        url: str = reverse("alterar-classificacao", kwargs={'pk': document.pk})
        payload: Dict[str, Any] = {"classification_status": 999} # ID de status inexistente

        response = api_client.patch(url, payload, format="json")

        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore
        