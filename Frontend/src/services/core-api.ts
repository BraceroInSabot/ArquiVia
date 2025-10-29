import axios from 'axios';

const BASE: string = "https://bracero.com.br/"
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

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

export default api;