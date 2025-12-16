import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import type { UserDetails } from '../services/core-api';
import userService from '../services/User/api';
import api from '../services/core-api'; 

interface AuthContextType {
  user: UserDetails | null;
  isLoading: boolean;
  // Login Social (Google - JWT)
  signIn: (accessToken: string, refreshToken: string, rawUser: any) => void;
  // Login Padrão (Usuário/Senha - Sessão)
  login: (username: string) => Promise<void>; 
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@arquivia:user';
const TOKEN_COOKIE_KEY = 'access_token'; 
const REFRESH_COOKIE_KEY = 'refresh_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Função Auxiliar para Persistir Usuário ---
  const persistUser = (userData: UserDetails) => {
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  };

  // --- 1. Login Social (Google - JWT) ---
  const signIn = (accessToken: string, refreshToken: string, rawUser: any) => {
    // Salva Tokens nos Cookies
    const cookieOptions = { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' as const };
    Cookies.set(TOKEN_COOKIE_KEY, accessToken, cookieOptions);
    Cookies.set(REFRESH_COOKIE_KEY, refreshToken, cookieOptions);

    // Configura o Header
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Normaliza e Salva Usuário
    const normalizedUser: UserDetails = {
        sucesso: true,
        mensagem: "Login realizado via OAuth",
        data: {
            user_id: rawUser.pk || rawUser.user_id,
            username: rawUser.username,
            name: rawUser.name || `${rawUser.first_name} ${rawUser.last_name}`.trim(),
            email: rawUser.email,
            image: rawUser.image || ""
        }
    };
    persistUser(normalizedUser);
  };

  // --- 2. Login Padrão (Usuário e Senha - Sessão/Cookie) ---
  // Restaurado para funcionar com seu formulário de login antigo
  const login = async (username: string) => {
    setIsLoading(true);
    try {
      // Como o cookie de sessão é HttpOnly e automático, 
      // apenas buscamos os detalhes do usuário para confirmar o login.
      const response = await userService.getUserDetails(username);
      persistUser(response.data);
      
      // Nota: Não setamos token JWT aqui, pois o login padrão usa Session Cookie.
    } catch (error) {
      console.error("Erro no login padrão:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logout Unificado ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Limpa Tokens (Google)
    Cookies.remove(TOKEN_COOKIE_KEY);
    Cookies.remove(REFRESH_COOKIE_KEY);
    delete api.defaults.headers.common['Authorization'];

    // Chama endpoint de logout (Limpa Sessão Django)
    userService.logout().catch(() => {});
  };

  // --- Refresh User ---
  const refreshUser = async () => {
    // Se tiver token JWT (Google), injeta. Se não, confia no Cookie de Sessão.
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const username = user?.data.username;
    if (!username) throw new Error("Usuário não definido.");

    try {
      const response = await userService.getUserDetails(username);
      persistUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) logout();
      throw error;
    }
  };

  // --- Inicialização (F5) ---
  useEffect(() => {
    const initAuth = async () => {
      // 1. Tenta recuperar Token JWT (Login Google)
      const storedToken = Cookies.get(TOKEN_COOKIE_KEY);
      if (storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }

      // 2. Tenta recuperar Usuário (Login Google OU Padrão)
      const storedUserString = localStorage.getItem(USER_STORAGE_KEY);

      if (storedUserString) {
        try {
            const storedUser: UserDetails = JSON.parse(storedUserString);
            setUser(storedUser);

            // 3. Validação Opcional: Bater no backend para garantir que a sessão/token ainda vale
            // Isso cobre tanto o caso do Token expirado quanto do Cookie de sessão expirado
            await userService.getUserDetails(storedUser.data.username)
                .then(res => persistUser(res.data))
                .catch(() => {
                    // Se falhar a validação, desloga silenciosamente
                    // logout(); 
                    // (Comentado para evitar logout em erro de rede, descomente se quiser rigoroso)
                });
        } catch {
            logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth error');
  return context;
};