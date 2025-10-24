import api from '../core-api';
import type { Sector, CreateSectorData, ResponseStructure } from '../core-api';

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
};

export default sectorService;