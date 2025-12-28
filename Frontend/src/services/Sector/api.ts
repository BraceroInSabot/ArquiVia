import api from '../core-api';
import type { Sector, ResponseStructure, SectorUser, AddSectorUserPayload, promoteUserToManagerPayload, promoteUserToAdministratorPayload, ToggleSectorStatusPayload, RemoveSectorPayload, SectorDashboardData } from '../core-api';

const sectorService = {
    /**
     * Busca a lista de todos os setores que o usuário possui vínculo.
     *  
     */
  getSectors(): Promise<{ data: ResponseStructure<Sector[]> }> {
    return api.get('/setor/visualizar/');
  },

  /**
   * Cria um novo setor.
   * @param data - Objeto com nome, imagem e ID da empresa.
   */
  createSector(data: FormData): Promise<{ data: Sector }> {
    return api.post('/setor/criar/', data);
  },

  /**
   * Realiza a consulta do setor pelo ID.
   * @param id - ID do setor. Comumente pego pela listagem de setores.
   */
  getSectorById(id: number): Promise<{ data: ResponseStructure<Sector> }> {
    return api.get(`/setor/consultar/${id}/`);
  },

  /**
   * Busca a lista de usuários e suas funções em um setor específico.
   * @param sectorId - O ID do setor.
   */
  getSectorUsers(sectorId: number): Promise<{ data: ResponseStructure<SectorUser[]> }> {
    return api.get(`/setor/listar-usuarios-setor/${sectorId}/`);
  },

  /**
   * Adiciona um usuário a um setor.
   * @param sectorId O ID do setor.
   * @param data O payload com email e função do usuário.
   */
  addUserToSector(sectorId: number, data: AddSectorUserPayload): Promise<{ data: SectorUser }> {
    return api.post(`/setor/adicionar-usuario/${sectorId}/`, data);
  },

  /**
   * Remove um usuário de um setor.
   * @param sectorId O ID do setor.
   * @param userId O ID do usuário a ser removido.
   */

  removeUserFromSector(sectorUserLinkId: number): Promise<void> {
    return api.delete(`/setor/remover-usuario/${sectorUserLinkId}/`);
  },

  /**
   * Promove o usuário para gerente no setor.
   * @param sectorId O ID do setor.
   * @param userId O ID do usuário a ser promovido.
   */
  promoteUserToManager(sectorId: number, userEmail: promoteUserToManagerPayload): Promise<{ data: ResponseStructure<[]> }> {
    return api.patch(`/setor/definir-gerente/${sectorId}/`, userEmail);
  },

  /**
   * Promove (ou rebaixa) o usuário para administrador no setor.
   * @param sectorUserLinkId O ID do vínculo do usuário no setor.
   */
  promoteUserToAdministrator(data: promoteUserToAdministratorPayload) : Promise<{ data: ResponseStructure<[]> }> {
    return api.patch(`/setor/definir-administrador/${data.sectorUserLinkId}/`, {make_admin: data.makeAdmin});
  },

  /**
   * Altera o status de ativação de um setor (PATCH).
   * @param id O ID do setor a ser atualizado.
   */
  toggleSectorStatus(sectorId: ToggleSectorStatusPayload): Promise<{ data: Sector }> {
    return api.put(`/setor/ativar-desativar/${sectorId}/`);
  },

  /**
   * Remove um setor pelo ID.
   * @param id O ID do setor a ser removido.
   */
  deleteSector(sectorId: RemoveSectorPayload): Promise<void> {
    return api.delete(`/setor/excluir/${sectorId}/`);
  },

  /**
   * Atualiza os dados de um setor.
   * @param id O ID do setor a ser atualizado.
   * @param data Os novos dados do setor.
   */
  updateSector(id: number, data: FormData): Promise<{ data: Sector }> {
    return api.put(`/setor/alterar/${id}/`, data);
  },

  /**
   * Busca os dados do Dashboard Gerencial para um setor.
   * (Baseado na sua View)
   * @param sector_id O ID (pk) do setor.
   */
  getSectorDashboard(sector_id: number): Promise<{ data: ResponseStructure<SectorDashboardData> }> {
    return api.get(`/painel/gerencial/${sector_id}/`);
  },

  /*
   * Retorna dados sobre a política de revisão de documentos de um setor.
   * @param sectorId O ID do setor.
   */
  getReviewPolicy(sectorId: number): Promise<{ data: ResponseStructure<[]> }> {
    return api.get(`/setor/${sectorId}/politica-revisao/`);
  },

  /*
   * Atualiza a política de revisão de documentos de um setor.
   * @param sectorId O ID do setor.
   * @param data Os novos dados da política de revisão.
   */
  updateReviewPolicy(sectorId: number, data: FormData): Promise<{ data: ResponseStructure<[]> }> {
    return api.put(`/setor/${sectorId}/politica-revisao/`, data);
  },

  /*
   * Lista os usuários do setor com a sua devida hierarquia.
   * @param sectorId O ID do setor.
   */
  listSectorUsersWithHierarchy(sectorId: number): Promise<{ data: ResponseStructure<[]> }> {
    return api.get(`/setor/${sectorId}/usuarios/`);
  }
};

export default sectorService;