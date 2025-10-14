import axios from 'axios';

const BASE: string = "http://179.125.60.185:8081/"
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

const api = axios.create({
  baseURL: URL, // A URL base do seu backend Django
  withCredentials: true, // Essencial para enviar cookies de autenticação
});

export default api;