import api from '../../services/core-api';
import type { ResponseStructure, ManyPlans } from '../../services/core-api';
import type { PlanData } from '../../types/plans';

const paymentService = {
    /**
     * Retrieve the available payment plans.
     */
    getAvailablePlans(): Promise<{ data: ResponseStructure<ManyPlans> }> {
        return api.get<ResponseStructure<ManyPlans>>('/pagamento/planos-disponiveis/');
    },

    /**
     * Retrieve the user's current plan and usage data.
     */
    getPlanData(): Promise<{ data: ResponseStructure<PlanData> }> {
        return api.get<ResponseStructure<PlanData>>('/pagamento/dashboard/');
    },

    /**
     * Retrieve enterprise or sectors with premium active.
     */
    getActiveItems: async () => {
        const response = await api.get('/pagamento/planos-ativos/');
        return response.data.data; 
    },

    /**
     * Add an item on premium plan.
     * 
     * @param type - enterprise or sector
     * @param id - his identification
     */
    addItem: async (type: 'enterprise' | 'sector', id: number) => {
        return api.post('/pagamento/alterar-plano/', { type, id });
    },

    /**
     * Remove an item on a premium plan.
     * @param type - enterprise or sector
     * @param id - his identification 
     */
    removeItem: async (type: 'enterprise' | 'sector', id: number) => {
        return api.delete('/pagamento/alterar-plano/', { data: { type, id } });
    }
}

export default paymentService;