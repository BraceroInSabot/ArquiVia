import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { UserDetails } from '../services/core-api';
import userService from '../services/User/api';

interface AuthContextType {
  user: UserDetails | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'arquivia_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- ALTERAÇÃO AQUI ---
  // Este useEffect agora confia cegamente no localStorage,
  // pois não podemos validar com o backend http://
  useEffect(() => {
    const validateSessionFromLocalStorage = () => {
      const storedUserString = localStorage.getItem(USER_STORAGE_KEY);
      
      if (!storedUserString) {
        // Se não há usuário no storage, não está logado.
        setIsLoading(false);
        return;
      }
      
      try {
        // Tenta ler o usuário do storage.
        const storedUser: UserDetails = JSON.parse(storedUserString);
        setUser(storedUser); // Confia cegamente no storage.
      } catch (error) {
        // Storage corrompido, limpa tudo.
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false); // Termina a "validação".
      }
    };
    
    validateSessionFromLocalStorage();
  }, []); // Array vazio, roda só no F5

  // A função 'login' (chamada pelo LoginForm) ainda funciona como antes
  const login = async (username: string) => {
    try {
      const response = await userService.getUserDetails(username);
      const userDetails = response.data;
      
      setUser(userDetails);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userDetails));
    } catch (error) {
      console.error("Falha ao buscar detalhes do usuário após o login:", error);
      logout();
      throw error; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    userService.logout().catch(err => {
      console.error("Falha ao invalidar token no backend:", err);
    });
  };

  const value = { user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};