import axios from 'axios';

const BASE: string = import.meta.env.VITE_API_ENDPOINT
const VERSION: string = "api/v2/"
const URL: string = BASE + VERSION

export interface ApiRequestPayload<T> {
  query_param?: { [key: string]: any }; 
  data: T; 
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  name: string;
  email: string;
  password: string;
  cpassword: string;
}

export interface SectorShort {
  sector_id: number;
  name: string;
  is_active: boolean;
}

export interface Enterprise {
  enterprise_id: number;
  name: string;
  image: string;
  owner: number;
  owner_name: string;
  is_active: boolean;
  created_at: string;
  sectors: SectorShort[];
}

export interface ManyEnterprises {
  sucesso: boolean;
  mensagem: string;
  data: Enterprise[];
}

export interface CreateEnterprise {
  name: string;
  image: string;
}

export interface UpdateEnterpriseData {
  name: string;
  image?: string;
}

export interface Sector {
  sector_id: number;
  name: string;
  image: string;
  manager_id: number;
  manager_name: string;
  enterprise_name: string;
  enterprise_id: number;
  owner_id: number;
  owner_name: string;
  hierarchy_level: string;
  is_active: boolean;
  creation_date: string;
}

export interface CreateSectorData {
  name: string;
  image: string;
  enterprise_id: number; 
}

export interface UserDetails {
  data : {
    user_id: number;
    username: string;
    name: string;
    email: string;
    image: string;
  };
  sucesso: boolean;
  mensagem: string;
}

export interface ResponseStructure<T> {
  sucesso: boolean;
  mensagem: string;
  data: T;
}

export interface SectorUser {
  user_id: number;
  user_name: string;
  user_email: string;
  role: string;
  sector_user_id: number;
}

export interface AddSectorUserPayload {
  user_email: string;
}

export interface promoteUserToManagerPayload {
  new_manager_email: string;
}

export interface promoteUserToAdministratorPayload {
  sectorUserLinkId: number;
  makeAdmin: boolean;
}

export interface ToggleSectorStatusPayload {
  sector_id: number;
}

export interface RemoveSectorPayload {
  sector_id: number;
}

export interface UpdateSectorData {
  name: string;
  image: string;
}

export interface Document {
  document_id: number;
  content: {
    [key: string]: any;
  };
  title: string;
  categories: string[];
  author: string;
}

export interface CreateDocument {
  content: {
    [key: string]: any;
  };
  sector: number;
  categories: string[];
}

export interface DocumentList {
  document_id: number;
  title: string;
  creator_name: string;
  created_at: string;
  is_active: boolean;
  sector: string;
  enterprise: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: string;
}

export interface ClassificationStatus {
  status: string;
}

export interface ClassificationPrivacity {
  privacity: string;
}

export interface ReviewDetails {
  review_age_days: number;
  last_review_date_from_log: string;
}

export interface Classification {
  classification_id: number;
  is_reviewed: boolean;
  classification_status: ClassificationStatus | null;
  reviewer: {
    [key: string]: any | null;
  } | null;
  privacity: ClassificationPrivacity | null;
  review_details?: ReviewDetails | null;
}

export interface UpdateClassificationPayload {
  is_reviewed?: boolean;
  classification_status?: number | null;
  privacity?: number | null;
  reviewer?: number | null;
}


export interface Category {
  category_id: number;
  category: string; 
  description: string | null;
  is_public: boolean;
  color: string;
}

export interface CreateCategoryPayload {
  category: string;
  color: string;
  description?: string;
  is_public?: boolean;
  category_sector: number;
}

export interface UpdateCategoryPayload {
  sector_id: number; 
  category?: string;
  description?: string;
  is_public?: boolean;
  color: string;
}

export interface AddCategoriesPayload {
  categories_id: number[];
}

export interface AttachedFile {
  attached_file_id: number;
  title: string;
  file: string;
  attached_at: string;
}

export interface DocumentHistory {
  history_id: number;
  history_date: string;
  user_name: string;
  action: 'Criado' | 'Alterado' | 'Excluído';
  title: string;
  content: any;
}

export interface RequestPasswordReset {
  email: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  c_new_password: string;
}

export interface RecentDocument {
  document_id: number;
  title: string;
  created_at: string;
  status_label: string;
}

export interface ReviewPendingDocument {
  document_id: number;
  title: string;
  created_at: string;
  status_label: string;
}

export interface ActivityFeedItem {
  timestamp: string;
  message: string;
  action_type: "+" | "~" | "-";
  metadata: {
    document_id: number;
    user_id: number;
  };
}

export interface DashboardData {
  my_recent_documents: RecentDocument[];
  review_pending_documents: ReviewPendingDocument[];
  activity_feed: ActivityFeedItem[];
}

export interface KpiData {
  total_documentos: number;
  pendentes: number;
  concluidos: number;
  arquivados: number;
  publicos: number;
}

export interface GargaloDocument {
  document_id: number;
  title: string;
  created_at: string;
  status_label: string;
}

export interface TopColaborador {
  history_user__name: string;
  activity_count: number;
}

export interface InsightData {
  alerta_exclusoes_7dias: number;
  gargalos_pendentes: GargaloDocument[];
  top_colaboradores: TopColaborador[];
}

export interface SectorDashboardData {
  kpis: KpiData;
  insights: InsightData;
}

export interface DocumentFilters {
  searchTerm: string;
  isReviewed?: string;
  statusId?: string;
  privacityId?: string;
  reviewer?: string;
  categories?: string;
  groupBy?: 'none' | 'enterprise' | 'sector' | 'both';
  page?: number;
}

export interface AvailableCategorySearch {
  category_id: number;
  category: string;
  sector_name: string;
  enterprise_name: string;
}

export interface AvailableUser {
  user_id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GoogleLoginPayload {
  access_token: string;
}

export interface AuthResponse {
  access: string;        // O Token JWT de acesso
  refresh: string;       // O Token JWT de refresh
  user: {                // Dados do usuário
    pk?: number;
    user_id?: number;
    email: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

export default api;