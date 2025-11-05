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

        assert response.status_code == 201 # type: ignore # type: ignore #type: ignore
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

        assert response.status_code == 400 # type: ignore #type: ignore #type: ignore
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

        assert response.status_code == 401 # type: ignore #type: ignore #type: ignore
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

        assert response.status_code == 400 # type: ignore #type: ignore #type: ignore
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

        assert response.status_code == 400 # type: ignore  #type: ignore #type: ignore
        assert response.data['sucesso'] is False # type: ignore

@pytest.mark.django_db
class TestRetrieveDocumentAPI:
    """
    Suíte de testes para o endpoint RetrieveDocumentView (/consultar/<int:pk>/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário com utilizadores, empresa, setor e um documento
        com todas as suas relações para testes de permissão.
        """
        # 1. Criar Utilizadores
        owner = User.objects.create_user(username="retrieve_owner", password="pw", email="retrieve_owner@e.com", name="Retrieve Owner")
        manager = User.objects.create_user(username="retrieve_manager", password="pw", email="retrieve_manager@e.com", name="Retrieve Manager")
        member = User.objects.create_user(username="retrieve_member", password="pw", email="retrieve_member@e.com", name="Retrieve Member")
        outsider = User.objects.create_user(username="retrieve_outsider", password="pw", email="retrieve_outsider@e.com", name="Retrieve Outsider")

        # 2. Criar Estrutura
        enterprise = Enterprise.objects.create(name="Retrieve Corp", owner=owner)
        sector = Sector.objects.create(name="Retrieve Sector", enterprise=enterprise, manager=manager)
        
        # 3. Vincular membro ao setor
        SectorUser.objects.create(user=member, sector=sector)

        # 4. Criar Dados Padrão (necessários para a Classificação)
        status_padrao = Classification_Status.objects.create(status="Em andamento")
        privacidade_padrao = Classification_Privacity.objects.create(privacity="Privado")

        # 5. Criar o Documento (o alvo do teste)
        # O 'member' será o criador
        document = Document.objects.create(
            title="Documento de Teste para Recuperação",
            content={"ops": [{"insert": "Teste."}]},
            creator=member,
            sector=sector
        )
        
        # 6. Criar a Classificação associada
        Classification.objects.create(
            document=document,
            classification_status=status_padrao,
            privacity=privacidade_padrao,
            reviewer=manager
        )
        
        # 7. Criar e associar Categorias
        category = Category.objects.create(category="Teste", category_enterprise=enterprise)
        document.categories.set([category])

        return {
            "owner": owner,
            "manager": manager,
            "member": member,
            "outsider": outsider,
            "document": document,
        }

    # Success

    @pytest.mark.parametrize("role", ["owner", "manager", "member"])
    def test_retrieve_document_by_authorized_user_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any], role: str
    ) -> None:
        """
        Testa se utilizadores autorizados (owner, manager, member/creator) podem ver o documento.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
            role: (str): Possíveis papéis de utilizador
        
        Return:
            None
        """
        actor: User = scenario_data[role] # type: ignore
        document: Document = scenario_data["document"] # type: ignore
        api_client.force_authenticate(user=actor)
        url: str = reverse("consultar-documento", kwargs={'pk': document.pk})

        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore #type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['document_id'] == document.pk # type: ignore
        assert response.data['data']['title'] == "Documento de Teste para Recuperação" # type: ignore
        assert "classification" in response.data['data'] # type: ignore
        assert "categories" in response.data['data'] # type: ignore

    # Failures

    def test_retrieve_non_existent_document_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se requisitar um documento com PK inexistente retorna 404.

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
        url: str = reverse("consultar-documento", kwargs={'pk': non_existent_pk})

        response = api_client.get(url)
                
        assert response.status_code == 404 # type: ignore #type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_retrieve_document_by_anonymous_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        document: Document = scenario_data["document"] # type: ignore
        url: str = reverse("consultar-documento", kwargs={'pk': document.pk})

        response = api_client.get(url)

        assert response.status_code == 401 # type: ignore #type: ignore
        assert response.data['sucesso'] is False # type: ignore

    def test_retrieve_document_by_outsider_fails(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
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
        document: Document = scenario_data["document"] # type: ignore
        api_client.force_authenticate(user=outsider)
        url: str = reverse("consultar-documento", kwargs={'pk': document.pk})

        response = api_client.get(url)

        assert response.status_code == 403 # type: ignore #type: ignore
        assert response.data['sucesso'] is False # type: ignore

@pytest.mark.django_db
class TestListDocumentsAPI:
    """
    Suíte de testes para o endpoint ListDocumentsView (/visualizar/).
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Returns an APIClient instance for use in tests."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário complexo para testar todas as 4 regras de visibilidade de documentos.
        
        Usuários:
        - test_user: O usuário que fará a requisição.
        - other_user: Um outro usuário para ser o criador de alguns documentos.

        Documentos:
        - doc_created_by_me: Criado pelo 'test_user' (Regra: Criador).
        - doc_in_owned_enterprise: Criado pelo 'other_user' em um setor de uma empresa do 'test_user' (Regra: Dono da Empresa).
        - doc_in_managed_sector: Criado pelo 'other_user' em um setor gerenciado pelo 'test_user' (Regra: Gerente do Setor).
        - doc_in_member_sector: Criado pelo 'other_user' em um setor onde o 'test_user' é membro (Regra: Membro do Setor).
        - doc_unrelated: Um documento sem nenhuma relação com o 'test_user'.
        """
        # --- Criar Usuários ---
        test_user = User.objects.create_user(username="list_doc_user", password="pw", email="list@e.com", name="List User")
        other_user = User.objects.create_user(username="other_doc_user", password="pw", email="other@e.com", name="Other User")

        # --- Cenário 1: test_user é Dono da Empresa ---
        enterprise_owned = Enterprise.objects.create(name="Empresa do Test User", owner=test_user)
        sector_in_owned = Sector.objects.create(name="Setor da Empresa Própria", enterprise=enterprise_owned, manager=other_user)
        doc_in_owned_enterprise = Document.objects.create(title="Doc (Dono)", content={}, creator=other_user, sector=sector_in_owned)

        # --- Cenário 2: test_user é Gerente do Setor ---
        enterprise_other1 = Enterprise.objects.create(name="Outra Empresa 1", owner=other_user)
        sector_managed = Sector.objects.create(name="Setor Gerenciado", enterprise=enterprise_other1, manager=test_user)
        doc_in_managed_sector = Document.objects.create(title="Doc (Gerente)", content={}, creator=other_user, sector=sector_managed)

        # --- Cenário 3: test_user é Membro do Setor ---
        enterprise_other2 = Enterprise.objects.create(name="Outra Empresa 2", owner=other_user)
        sector_member = Sector.objects.create(name="Setor de Membro", enterprise=enterprise_other2, manager=other_user)
        SectorUser.objects.create(user=test_user, sector=sector_member)
        doc_in_member_sector = Document.objects.create(title="Doc (Membro)", content={}, creator=other_user, sector=sector_member)

        # --- Cenário 4: test_user é o Criador ---
        # Este documento está em um setor/empresa totalmente aleatório
        enterprise_other3 = Enterprise.objects.create(name="Outra Empresa 3", owner=other_user)
        sector_unrelated = Sector.objects.create(name="Setor Aleatório", enterprise=enterprise_other3, manager=other_user)
        doc_created_by_me = Document.objects.create(title="Doc (Criador)", content={}, creator=test_user, sector=sector_unrelated)

        # --- Cenário 5: Documento Não Relacionado ---
        doc_unrelated = Document.objects.create(title="Doc (Não Relacionado)", content={}, creator=other_user, sector=sector_unrelated)

        return {
            "test_user": test_user,
            "other_user": other_user,
            "doc_created_by_me": doc_created_by_me,
            "doc_in_owned_enterprise": doc_in_owned_enterprise,
            "doc_in_managed_sector": doc_in_managed_sector,
            "doc_in_member_sector": doc_in_member_sector,
            "doc_unrelated": doc_unrelated
        }

    # Success

    def test_list_documents_success(self, api_client: APIClient, scenario_data: Dict[str, Any]) -> None:
        """
        Testa se a 'ListDocumentsView' retorna com sucesso todos os 4 documentos
        vinculados ao usuário, e nenhum documento não relacionado.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        test_user: User = scenario_data["test_user"] # type: ignore
        api_client.force_authenticate(user=test_user)
        url: str = reverse("visualizar-documentos") 

        response = api_client.get(url)

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        
        data_list: List[Dict[str, Any]] = response.data['data'] # type: ignore
        
        assert len(data_list) == 4

        returned_doc_ids = {item['document_id'] for item in data_list}

        assert scenario_data["doc_created_by_me"].pk in returned_doc_ids # type: ignore
        assert scenario_data["doc_in_owned_enterprise"].pk in returned_doc_ids # type: ignore
        assert scenario_data["doc_in_managed_sector"].pk in returned_doc_ids # type: ignore
        assert scenario_data["doc_in_member_sector"].pk in returned_doc_ids # type: ignore
        
        assert scenario_data["doc_unrelated"].pk not in returned_doc_ids # type: ignore

    def test_list_documents_no_links_success(self, api_client: APIClient) -> None:
        """
        Testa se um utilizador autenticado mas sem vínculos a nenhum documento
        recebe uma lista vazia.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
        
        Return:
            None
        """
        no_link_user = User.objects.create_user(username="no_link_doc_user", password="pw", email="nolink_doc@e.com", name="No Link")
        api_client.force_authenticate(user=no_link_user)
        url: str = reverse("visualizar-documentos")

        response = api_client.get(url)
        
        with open('log.txt', 'w') as f:
            f.write(str(response.data)) # type: ignore

        assert response.status_code == 200 # type: ignore
        assert response.data['sucesso'] is True # type: ignore
        assert "Nenhum documento encontrado." in response.data['mensagem'] # type: ignore

    # Failure

    def test_list_documents_anonymous_fails(self, api_client: APIClient) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
        
        Return:
            None
        """
        url: str = reverse("visualizar-documentos")

        response = api_client.get(url)

        assert response.status_code == 401 # type: ignore
        assert response.data['sucesso'] is False # type: ignore