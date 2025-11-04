export interface Document {
  id: string;
  title: string;
  type: 'Contract' | 'Invoice' | 'Report';
  createdAt: string;
  author: string;
}

export interface DocumentFilters {
  searchTerm?: string;
  type?: 'Contract' | 'Invoice' | 'Report' | 'All';
  dateFrom?: string;
  dateTo?: string;
}