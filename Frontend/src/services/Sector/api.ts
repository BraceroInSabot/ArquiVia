import api from '../core-api';
import type { Sector, CreateSectorData, ResponseStructure, SectorUser } from '../core-api';

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
};

export default sectorService;