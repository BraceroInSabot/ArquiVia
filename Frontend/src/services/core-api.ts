import axios from 'axios';

// const BASE: string = "https://bracero.com.br/"
const BASE: string = "http://localhost:8000/"
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

export interface Enterprise {
  enterprise_id: number;
  name: string;
  image: string;
  owner: number;
  owner_name: string;
  is_active: boolean;
  created_at: string;
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

export interface DocumentFilters {
  searchTerm?: string;
  type?: 'Contract' | 'Invoice' | 'Report' | 'All';
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentList {
  document_id: number;
  title: string;
  creator_name: string;
  created_at: string;
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

export interface Classification {
  classification_id: number;
  is_reviewed: boolean;
  classification_status: ClassificationStatus | null;
  reviewer: {
    [key: string]: any | null;
  } | null;
  privacity: ClassificationPrivacity | null;
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
}

export interface CreateCategoryPayload {
  category: string;
  description?: string;
  is_public?: boolean;
  category_sector: number;
}

export interface UpdateCategoryPayload {
  sector_id: number; 
  category?: string;
  description?: string;
  is_public?: boolean;
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

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

export default api;