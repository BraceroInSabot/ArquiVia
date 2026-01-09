import type { Enterprise } from "../services/core-api";

interface EnterpriseListProps {
  enterprises: Enterprise[] | any; 
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}

export type { EnterpriseListProps };