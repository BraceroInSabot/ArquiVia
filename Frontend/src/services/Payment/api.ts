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
}

export default paymentService;