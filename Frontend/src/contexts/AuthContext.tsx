import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie'; // <--- Importe o js-cookie
import type { UserDetails } from '../services/core-api';
import userService from '../services/User/api';
import api from '../services/core-api'; 

interface AuthContextType {
  user: UserDetails | null;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string, rawUser: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Nomes das chaves
const USER_STORAGE_KEY = '@arquivia:user';
const TOKEN_COOKIE_KEY = 'access_token';  // Nome do cookie
const REFRESH_COOKIE_KEY = 'refresh_token'; // Nome do cookie

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Função de Login ---
  const signIn = (accessToken: string, refreshToken: string, rawUser: any) => {
    // 1. Salva Tokens nos Cookies
    // 'expires: 7' define validade de 7 dias (ajuste conforme a expiração do seu JWT)
    // 'secure: true' exige HTTPS (bom para produção)
    // 'sameSite: Strict' protege contra CSRF
    const cookieOptions = { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' as const };
    
    Cookies.set(TOKEN_COOKIE_KEY, accessToken, cookieOptions);
    Cookies.set(REFRESH_COOKIE_KEY, refreshToken, cookieOptions);

    // 2. Normaliza e Salva Usuário no LocalStorage (Cookies são pequenos para objetos JSON grandes)
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
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));

    // 3. Configura o Axios (Importante: Cookies não vão sozinhos no header Authorization, precisa injetar)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // 4. Atualiza Estado
    setUser(normalizedUser);
  };

  // --- Logout ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Remove Cookies
    Cookies.remove(TOKEN_COOKIE_KEY);
    Cookies.remove(REFRESH_COOKIE_KEY);
    
    delete api.defaults.headers.common['Authorization'];
    userService.logout().catch(() => {});
  };

  // --- Refresh User ---
  const refreshUser = async () => {
    // Lê do Cookie
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const username = user?.data.username;
    if (!username) throw new Error("Usuário não definido.");

    try {
      const response = await userService.getUserDetails(username);
      const freshUser = response.data;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
      setUser(freshUser);
    } catch (error: any) {
      if (error.response?.status === 401) logout();
      throw error;
    }
  };

  // --- Inicialização (F5) ---
  useEffect(() => {
    const initAuth = async () => {
      // Lê Tokens dos Cookies e Usuário do LocalStorage
      const storedToken = Cookies.get(TOKEN_COOKIE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
            setUser(JSON.parse(storedUser));
        } catch {
            logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth error');
  return context;
};