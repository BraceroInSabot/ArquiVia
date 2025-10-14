import api from '../core-api';
import type { Enterprise, CreateEnterprise } from '../core-api';

const enterpriseService = {
    /**
   * Busca a lista de todas as empresas que o usuário possui vinculo..
   */
    getEnterprises(): Promise<{ data: Enterprise[] }> {
        return api.get('/empresa/visualizar');
    },

    /**
   * Cria uma nova empresa.
   * @param data - Objeto com nome e cnpj.
   */
    createEnterprise(data: CreateEnterprise): Promise<{ data: Enterprise }> {
        return api.post('/empresa/criar', data);
    },
}

export default enterpriseService;