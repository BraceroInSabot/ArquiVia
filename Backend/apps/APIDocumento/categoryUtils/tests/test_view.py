import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.response import Response as DRFResponse
from typing import Dict, Any, List

# Importe os seus modelos
from apps.APIEmpresa.models import Enterprise
from apps.APISetor.models import Sector, SectorUser
from apps.APIDocumento.models import Category, Classification, Classification_Privacity, Classification_Status, Document

User = get_user_model()

@pytest.mark.django_db
class TestDeleteCategoryAPI:
    """
    Suíte de testes para o endpoint DeleteCategoryView (/categoria/excluir/<int:pk>/).
    
    Testa todos os cenários de permissão (IsCategoryEditor),
    a validação de integridade (DeleteCategorySerializer) e as
    respostas de sucesso e erro.
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Retorna uma instância de APIClient para os testes."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário complexo para testar as permissões de exclusão:
        - 1 Empresa (Corp A)
        - 1 Setor (S1)
        - 5 Usuários (Owner, Manager S1, Admin S1, Member S1, Outsider)
        - 3 Categorias:
            - 'cat_s1_clean': Vinculada ao S1, sem documentos (pode ser excluída)
            - 'cat_in_use': Vinculada ao S1, COM 1 documento (NÃO pode ser excluída)
            - 'cat_enterprise': Global da empresa, sem documentos (pode ser excluída)
        """
        # --- Usuários ---
        owner = User.objects.create_user(username="owner_del", password="pw", name="Owner", email='user@gmail.com')
        manager_s1 = User.objects.create_user(username="manager_s1_del", password="pw", name="Manager S1", email='user2@gmail.com')
        admin_s1 = User.objects.create_user(username="admin_s1_del", password="pw", name="Admin S1", email='user3@gmail.com')
        member_s1 = User.objects.create_user(username="member_s1_del", password="pw", name="Member S1", email='user4@gmail.com')
        outsider = User.objects.create_user(username="outsider_del", password="pw", name="Outsider", email='user5@gmail.com')

        # --- Empresas ---
        enterprise_A = Enterprise.objects.create(name="Corp A Delete", owner=owner)
        Enterprise.objects.create(name="Corp B Delete", owner=outsider)

        # --- Setores ---
        sector_1 = Sector.objects.create(name="Setor 1", enterprise=enterprise_A, manager=manager_s1)

        # --- Vínculos (SectorUser) ---
        SectorUser.objects.create(user=admin_s1, sector=sector_1, is_adm=True)
        SectorUser.objects.create(user=member_s1, sector=sector_1, is_adm=False)

        # --- Categorias (Objetos de Teste) ---
        cat_s1_clean = Category.objects.create(
            category="Categoria S1 Limpa", 
            category_enterprise=enterprise_A, 
            category_sector=sector_1
        )
        cat_in_use = Category.objects.create(
            category="Categoria S1 Em Uso",
            category_enterprise=enterprise_A,
            category_sector=sector_1
        )
        cat_enterprise = Category.objects.create(
            category="Categoria Empresa Limpa",
            category_enterprise=enterprise_A,
            category_sector=None
        )

        # --- Dependência (Documento) ---
        # (Dados básicos para criar a Classificação obrigatória do Documento)
        status = Classification_Status.objects.create(status="Aprovado")
        privacity = Classification_Privacity.objects.create(privacity="Interno")
        
        classification = Classification.objects.create(
            classification_status=status, 
            privacity=privacity,
            reviewer=owner
        )
        
        doc_1 = Document.objects.create(
            title="Doc Com Classificação", 
            content={}, 
            creator=owner, 
            sector=sector_1,
            classification=classification
            )
        
        doc_1.categories.add(cat_in_use)


        return {
            "owner": owner,
            "manager_s1": manager_s1,
            "admin_s1": admin_s1,
            "member_s1": member_s1,
            "outsider": outsider,
            "cat_s1_clean": cat_s1_clean,
            "cat_in_use": cat_in_use,
            "cat_enterprise": cat_enterprise,
        }

    # Success

    def test_delete_sector_category_as_owner_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Dono da Empresa pode excluir uma categoria de setor (limpa).
        """
        user: User = scenario_data["owner"] # type: ignore
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        
        assert not Category.objects.filter(pk=category_pk).exists()

    def test_delete_sector_category_as_sector_manager_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Gestor do Setor pode excluir a categoria (limpa).
        """
        user: User = scenario_data["manager_s1"] # type: ignore
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 200
        assert not Category.objects.filter(pk=category_pk).exists()

    def test_delete_sector_category_as_sector_admin_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Administrador do Setor pode excluir a categoria (limpa).
        """
        user: User = scenario_data["admin_s1"] # type: ignore
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 200
        assert not Category.objects.filter(pk=category_pk).exists()

    # Failures

    def test_delete_sector_category_as_sector_member_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um Membro comum do setor é bloqueado (403).
        """
        user: User = scenario_data["member_s1"] # type: ignore
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore
        assert Category.objects.filter(pk=category_pk).exists()

    def test_delete_enterprise_category_as_sector_manager_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um Gestor de Setor (Manager S1) é bloqueado (403) ao
        tentar excluir uma categoria global da empresa (sem setor).
        """
        user: User = scenario_data["manager_s1"] # type: ignore
        category: Category = scenario_data["cat_enterprise"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 403
        assert Category.objects.filter(pk=category_pk).exists() 

    def test_delete_category_as_outsider_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um usuário de outra empresa é bloqueado (403).
        """
        user: User = scenario_data["outsider"] # type: ignore
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 403
        assert Category.objects.filter(pk=category_pk).exists() 

    def test_delete_category_by_anonymous_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um usuário não autenticado (anônimo) recebe 401.
        """
        category: Category = scenario_data["cat_s1_clean"] # type: ignore
        category_pk = category.pk
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})

        response = api_client.delete(url)
        
        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore
        assert Category.objects.filter(pk=category_pk).exists() 
        
    def test_delete_non_existent_category_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se requisitar uma categoria com PK inexistente retorna 404.
        """
        user: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=user)
        non_existent_pk: int = 9999
        url: str = reverse("excluir-categoria", kwargs={'pk': non_existent_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore

    def test_delete_category_in_use_by_document_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se a exclusão é barrada (400) se a categoria estiver
        associada a um documento (validação do DeleteCategorySerializer).
        """
        user: User = scenario_data["owner"] # type: ignore
        category: Category = scenario_data["cat_in_use"] # type: ignore
        category_pk = category.pk
        api_client.force_authenticate(user=user)
        
        url: str = reverse("excluir-categoria", kwargs={'pk': category_pk})
        
        response = api_client.delete(url)
        
        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore
        
        assert Category.objects.filter(pk=category_pk).exists()

@pytest.mark.django_db
class TestUpdateCategoryAPI:
    """
    Suíte de testes para o endpoint UpdateCategoryView (/categoria/atualizar/<int:pk>/).
    
    Testa todos os cenários de permissão (IsCategoryEditor), validações
    de dados (UpdateCategorySerializer) e respostas de sucesso e erro.
    """

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Retorna uma instância de APIClient para os testes."""
        return APIClient()

    @pytest.fixture
    def scenario_data(self) -> Dict[str, Any]:
        """
        Cria um cenário complexo para testar as permissões de edição:
        - 1 Empresa (Corp A)
        - 2 Setores (S1, S2)
        - 6 Usuários (Owner, Manager S1, Admin S1, Member S1, Manager S2, Outsider)
        - 3 Categorias (1 em S1, 1 global na empresa, 1 para teste de colisão)
        """
        # --- Usuários ---
        owner = User.objects.create_user(username="owner_upd", password="pw", name="Owner", email="user1@gmail.com")
        manager_s1 = User.objects.create_user(username="manager_s1_upd", password="pw", name="Manager S1", email="user2@gmail.com")
        admin_s1 = User.objects.create_user(username="admin_s1_upd", password="pw", name="Admin S1", email="user3@gmail.com")
        member_s1 = User.objects.create_user(username="member_s1_upd", password="pw", name="Member S1", email="user4@gmail.com")
        manager_s2 = User.objects.create_user(username="manager_s2_upd", password="pw", name="Manager S2", email="user5@gmail.com")
        outsider = User.objects.create_user(username="outsider_upd", password="pw", name="Outsider", email="user6@gmail.com")

        # --- Empresas ---
        enterprise_A = Enterprise.objects.create(name="Corp A Update", owner=owner)
        Enterprise.objects.create(name="Corp B Update", owner=outsider) # Empresa do Outsider

        # --- Setores ---
        sector_1 = Sector.objects.create(name="Setor 1", enterprise=enterprise_A, manager=manager_s1)
        sector_2 = Sector.objects.create(name="Setor 2", enterprise=enterprise_A, manager=manager_s2)

        # --- Vínculos (SectorUser) ---
        SectorUser.objects.create(user=admin_s1, sector=sector_1, is_adm=True)
        SectorUser.objects.create(user=member_s1, sector=sector_1, is_adm=False)

        # --- Categorias (Objetos de Teste) ---
        # Categoria privada, vinculada ao Setor 1
        cat_s1 = Category.objects.create(
            category="Categoria S1", 
            category_enterprise=enterprise_A, 
            category_sector=sector_1,
            is_public=False
        )
        # Categoria pública, global da Empresa A (sem setor)
        cat_enterprise = Category.objects.create(
            category="Categoria Empresa",
            category_enterprise=enterprise_A,
            category_sector=None,
            is_public=True
        )
        # Categoria para testar colisão de nome
        cat_collision_target = Category.objects.create(
            category="Nome Alvo",
            category_enterprise=enterprise_A,
            category_sector=None
        )

        return {
            "owner": owner,
            "manager_s1": manager_s1,
            "admin_s1": admin_s1,
            "member_s1": member_s1,
            "manager_s2": manager_s2,
            "outsider": outsider,
            "enterprise_A": enterprise_A,
            "sector_1": sector_1,
            "sector_2": sector_2,
            "cat_s1": cat_s1,
            "cat_enterprise": cat_enterprise,
            "cat_collision_target": cat_collision_target,
        }

    # --- Testes de Sucesso (Permissão) ---

    def test_update_sector_category_as_owner_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Dono da Empresa pode atualizar uma categoria de setor.
        """
        user: User = scenario_data["owner"] # type: ignore
        category: Category = scenario_data["cat_s1"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Atualizado pelo Dono"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['category'] == data['category'] # type: ignore
        category.refresh_from_db()
        assert category.category == data['category']

    def test_update_sector_category_as_sector_manager_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Gestor do Setor pode atualizar a categoria.
        """
        user: User = scenario_data["manager_s1"] # type: ignore
        category: Category = scenario_data["cat_s1"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Atualizado pelo Gestor S1"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore

    def test_update_sector_category_as_sector_admin_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Administrador do Setor pode atualizar a categoria.
        """
        user: User = scenario_data["admin_s1"] # type: ignore
        category: Category = scenario_data["cat_s1"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Atualizado pelo Admin S1"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore

    def test_update_enterprise_category_as_owner_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Dono pode atualizar uma categoria global da empresa (sem setor).
        """
        user: User = scenario_data["owner"] # type: ignore
        category: Category = scenario_data["cat_enterprise"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"description": "Descrição atualizada pelo Dono"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['description'] == data['description'] # type: ignore

    # --- Testes de Falha (Permissão - 403) ---

    def test_update_sector_category_as_sector_member_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um Membro comum do setor é bloqueado (403).
        """
        user: User = scenario_data["member_s1"] # type: ignore
        category: Category = scenario_data["cat_s1"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Falha (Membro)"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    def test_update_sector_category_as_other_sector_manager_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um Gestor de outro setor (Manager S2) é bloqueado (403).
        """
        user: User = scenario_data["manager_s2"] # type: ignore
        category: Category = scenario_data["cat_s1"] # Categoria do Setor 1
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Falha (Manager S2)"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    def test_update_sector_category_as_outsider_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um usuário de outra empresa é bloqueado (403).
        """
        user: User = scenario_data["outsider"] # type: ignore
        category: Category = scenario_data["cat_s1"] # type: ignore
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Falha (Outsider)"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    def test_update_enterprise_category_as_sector_manager_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um Gestor de Setor (Manager S1) é bloqueado (403) ao
        tentar editar uma categoria global da empresa (sem setor).
        """
        user: User = scenario_data["manager_s1"] # type: ignore
        category: Category = scenario_data["cat_enterprise"] # Categoria da Empresa
        api_client.force_authenticate(user=user)
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Falha (Manager S1 em Cat Empresa)"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    # --- Testes de Falha (Input/Estado - 400, 401, 404) ---

    def test_update_category_by_anonymous_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um usuário não autenticado (anônimo) recebe 401.
        """
        category: Category = scenario_data["cat_s1"] # type: ignore
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        data: Dict[str, str] = {"category": "Falha (Anônimo)"}

        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore

    def test_update_non_existent_category_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se requisitar uma categoria com PK inexistente retorna 404.
        """
        user: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=user)
        non_existent_pk: int = 9999
        url: str = reverse("alterar-categoria", kwargs={'pk': non_existent_pk})
        data: Dict[str, str] = {"category": "Falha (404)"}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore

    def test_update_category_with_duplicate_name_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa a validação (validate_category) que impede nomes duplicados
        na mesma empresa. Retorna 400.
        """
        user: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=user)
        
        category_to_update: Category = scenario_data["cat_s1"] # type: ignore
        target_category: Category = scenario_data["cat_collision_target"] # type: ignore
        
        url: str = reverse("alterar-categoria", kwargs={'pk': category_to_update.pk})
        
        # Tenta renomear 'cat_s1' com o nome da 'cat_collision_target'
        data: Dict[str, str] = {"category": target_category.category}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore

    def test_update_category_with_invalid_data_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa as validações de tipo de dados do serializer (ex: 'category'
        muito curto). Retorna 400.
        """
        user: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=user)
        category: Category = scenario_data["cat_s1"] # type: ignore
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})
        
        data: Dict[str, Any] = {
            "category": "a", # min_length=3
            "is_public": "nao-booleano" 
        }
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 400
        assert response.data['sucesso'] is False # type: ignore

    # --- Testes de Lógica de Atualização (Sucesso) ---

    def test_update_category_move_sector_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se o Dono pode mover uma categoria do Setor 1 para o Setor 2.
        """
        user: User = scenario_data["owner"] # type: ignore
        api_client.force_authenticate(user=user)
        
        category: Category = scenario_data["cat_s1"] # type: ignore
        sector_2: Sector = scenario_data["sector_2"] # type: ignore
        url: str = reverse("alterar-categoria", kwargs={'pk': category.pk})

        data: Dict[str, Any] = {
            "category_sector": sector_2.pk
        }
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        
        category.refresh_from_db()
        assert category.category_sector == sector_2

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
        
@pytest.mark.django_db
class TestRetrieveCategoryAPI:
    """
    Suíte de testes para o endpoint RetrieveCategoryView (/categoria/consultar/<int:pk>/).
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
        user_A = User.objects.create_user(username="retrieve_cat_A", password="pw", email="A@e.com", name="User A")
        user_B = User.objects.create_user(username="retrieve_cat_B", password="pw", email="B@e.com", name="User B")

        enterprise_A = Enterprise.objects.create(name="Corp A", owner=user_A)
        enterprise_B = Enterprise.objects.create(name="Corp B", owner=user_B)
        
        # Categoria 1: Privada e Vinculada ao User A
        cat_A_private = Category.objects.create(category="Privada A", category_enterprise=enterprise_A, is_public=False)
        
        # Categoria 2: Pública (em uma empresa não relacionada)
        cat_public = Category.objects.create(category="Pública", category_enterprise=enterprise_B, is_public=True)
        
        # Categoria 3: Privada e Não Vinculada ao User A
        cat_B_private = Category.objects.create(category="Privada B", category_enterprise=enterprise_B, is_public=False)

        return {
            "user_A": user_A,
            "user_B": user_B,
            "cat_A_private": cat_A_private,
            "cat_public": cat_public,
            "cat_B_private": cat_B_private,
        }

    # Success

    def test_retrieve_linked_private_category_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador vinculado pode ver a sua categoria privada.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_A"] # type: ignore
        category: Category = scenario_data["cat_A_private"] # type: ignore
        api_client.force_authenticate(user=user)
        url: str = reverse("consultar-categoria", kwargs={'pk': category.pk}) # Assumindo o nome da URL

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['category_id'] == category.pk # type: ignore
        assert response.data['data']['category'] == "Privada A" # type: ignore

    def test_retrieve_public_category_success(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador (mesmo não vinculado) pode ver uma categoria pública.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_A"] # type: ignore
        category: Category = scenario_data["cat_public"] # type: ignore
        api_client.force_authenticate(user=user)
        url: str = reverse("consultar-categoria", kwargs={'pk': category.pk})

        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data['sucesso'] is True # type: ignore
        assert response.data['data']['category'] == "Pública" # type: ignore

    # Failures

    def test_retrieve_unlinked_private_category_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador não vinculado recebe 403 ao tentar ver uma categoria privada.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_A"] # type: ignore
        category: Category = scenario_data["cat_B_private"] # type: ignore
        api_client.force_authenticate(user=user)
        url: str = reverse("consultar-categoria", kwargs={'pk': category.pk})

        response = api_client.get(url)

        assert response.status_code == 403
        assert response.data['sucesso'] is False # type: ignore

    def test_retrieve_non_existent_category_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se requisitar uma categoria com PK inexistente retorna 404.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        user: User = scenario_data["user_A"] # type: ignore
        api_client.force_authenticate(user=user)
        non_existent_pk: int = 999
        url: str = reverse("consultar-categoria", kwargs={'pk': non_existent_pk})

        response = api_client.get(url)
                
        assert response.status_code == 404
        assert response.data['sucesso'] is False # type: ignore

    def test_retrieve_category_by_anonymous_fails(
        self, api_client: APIClient, scenario_data: Dict[str, Any]
    ) -> None:
        """
        Testa se um utilizador não autenticado (anônimo) recebe um erro 401.

        Args:
            self: A instância de teste.
            api_client (APIClient) : cliente de API para uso em login
            scenario_data (Dict[str, object]) : cenário para simular um ambiente determinado
        
        Return:
            None
        """
        category: Category = scenario_data["cat_A_private"] # type: ignore
        url: str = reverse("consultar-categoria", kwargs={'pk': category.pk})

        response = api_client.get(url)

        assert response.status_code == 401
        assert response.data['sucesso'] is False # type: ignore
