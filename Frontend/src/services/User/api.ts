import type { LoginCredentials, RegisterCredentials, UserDetails } from '../core-api';
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
};

export default userService;