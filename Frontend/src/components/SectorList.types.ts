import type { Sector } from '../services/core-api';

export interface SectorGroup {
  enterpriseName: string;
  sectors: Sector[];
}