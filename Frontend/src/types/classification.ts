import type { ExclusiveUser } from "../services/core-api";

export interface ReviewDetails {
  review_age_days: number;
  last_review_date_from_log: string;
}

export interface ClassificationFormData {
  is_reviewed: boolean;
  classification_status: number | null;
  privacity: number | null;
  reviewer: number | null; 
  review_details?: ReviewDetails | null;
  exclusive_users?: ExclusiveUser[];
}

export const STATUS_OPTIONS = [
  { id: 1, name: "Concluído" },
  { id: 2, name: "Em andamento" },
  { id: 3, name: "Revisão necessária" },
  { id: 4, name: "Arquivado" }
];

export const PRIVACITY_OPTIONS = [
  { id: 1, name: "Privado" },
  { id: 2, name: "Público" },
  { id: 3, name: "Exclusivo" }
];