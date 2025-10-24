import api from '../core-api';
import type { Sector } from '../core-api';

const sectorService = {
  getSectors(): Promise<{ data: Sector[] }> {
    return api.get('/setor/visualizar/');
  },
};

export default sectorService;