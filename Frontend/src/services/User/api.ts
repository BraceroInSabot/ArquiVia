import type { LoginCredentials, RequestPasswordReset, ResponseStructure, UserDetails } from '../core-api';
import api from '../core-api'

const userService = {
  /**
   * Realiza o login do usuário.
   * @param credentials - Um objeto contendo username e password.
   */

  login(credentials: LoginCredentials) {
    return api.post('/usuario/entrar/', credentials);
  },
  /**
   * Realiza a criação de conta do usuário.
   * @param register_credentials - um objeto contendo os dados do usuário a serem validados
   */
  register(register_credentials: FormData) {
    return api.post('/usuario/criar-conta/', register_credentials);
  },
  /**
   * Realiza o logout (saída) da conta do usuário
   */
  logout() {
    return api.post('/usuario/sair/');
  },

  /**
   * Busca os detalhes completos do usuário logado.
   * A API identifica o usuário pelo cookie JWT.
   */
  getUserDetails(username: string): Promise<{ data: UserDetails }> {
    return api.get(`/usuario/consultar/${username}/`);
  },

  /**
   * Solicita um email para redefinição de senha.
   */
  requestPasswordReset(email: RequestPasswordReset): Promise<{ data: ResponseStructure<null> }>{
    return api.post('/usuario/esqueci-senha/', email);
  },

  /**
   * Redefine a senha.
   */
  resetPasswordByToken(token: string, password: string): Promise<{ data: ResponseStructure<null> }>{
    return api.post(`/usuario/redefinir-senha/${token}/`, password);
  },

  /**
   * Valida se o Token ctoninua válido
   */
  validateToken(token: string): Promise<{ data: ResponseStructure<null> }>{
    return api.get(`/usuario/validar-token-senha/${token}/`);
  },
};

export default userService;