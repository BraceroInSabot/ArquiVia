import type { LoginCredentials } from '../core-api';
import api from '../core-api'

const userService = {
  /**
   * Realiza o login do usuário.
   * @param credentials - Um objeto contendo username e password.
   */

  login(credentials: LoginCredentials) {
    return api.post('/usuario/entrar', credentials);
  },
};

export default userService;