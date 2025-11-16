import api from '../core-api';
import type { DashboardData, ResponseStructure } from '../core-api';

const dashboardService = {
    /**
     * Busca os dados agregados para o painel de controle.
     */
    getDashboardData(): Promise<{ data: ResponseStructure<DashboardData> }> {
        return api.get('/painel/operacional/');
    },
};

export default dashboardService;