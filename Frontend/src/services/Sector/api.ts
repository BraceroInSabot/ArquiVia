import api from '../core-api';
import type { Sector, CreateSectorData, ResponseStructure, SectorUser, AddSectorUserPayload, promoteUserToManagerPayload, promoteUserToAdministratorPayload, ToggleSectorStatusPayload, RemoveSectorPayload } from '../core-api';

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
  createSector(data: CreateSectorData): Promise<{ data: Sector }> {
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
};

export default sectorService;