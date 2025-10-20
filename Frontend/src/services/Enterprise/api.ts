import api from '../core-api';
import type { Enterprise, CreateEnterprise, ManyEnterprises, UpdateEnterpriseData } from '../core-api';

const enterpriseService = {
    /**
   * Busca a lista de todas as empresas que o usuário possui vinculo..
   */
    getEnterprises(): Promise<{ data: ManyEnterprises }> {
        return api.get<ManyEnterprises>('/empresa/visualizar/');
    },

    /**
     * Realiza a consulta da empresa pelo ID.
     * @param id - ID da empresa. Comumente pego pela listagem de empresas ou vinculo de setor.
    */
    getEnterpriseById(id: number): Promise<{ data: Enterprise }> {
        return api.get<Enterprise>(`/empresa/consultar/${id}/`);
    },

    /**
   * Cria uma nova empresa.
   * @param data - Objeto com nome e cnpj.
   */
    createEnterprise(data: CreateEnterprise): Promise<{ data: Enterprise }> {
        return api.post('/empresa/criar/', data);
    },

    /**
   * Atualiza os dados de uma empresa existente.
   * @param id - O ID da empresa a ser atualizada.
   * @param data - Os novos dados da empresa.
   */
    updateEnterprise(id: number, data: UpdateEnterpriseData): Promise<{ data: Enterprise }> {
        return api.put(`/empresa/alterar/${id}/`, data);
    },
}

export default enterpriseService;