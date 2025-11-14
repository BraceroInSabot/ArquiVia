import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { UserDetails } from '../services/core-api';
import userService from '../services/User/api';

interface AuthContextType {
  user: UserDetails | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // Nova função útil para atualizar dados manualmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'arquivia_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para salvar e definir usuário
  const persistUser = (userData: UserDetails) => {
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  };

  // Função de Logout centralizada
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Tenta avisar o backend, mas não bloqueia o logout visual se falhar
    userService.logout().catch(err => {
      console.warn("Falha ao invalidar token no backend (pode já estar expirado):", err);
    });
    
    // Opcional: Redirecionar para /entrar aqui se não estiver usando ProtectedRoute
    // window.location.href = '/entrar'; 
  };

  // Função para revalidar/atualizar dados do usuário (Resolve o problema da imagem S3)
  const refreshUser = async () => {
    // Tenta pegar o usuário do estado atual ou do storage
    const storedUserString = localStorage.getItem(USER_STORAGE_KEY);
    let usernameToFetch = user?.data.username;

    if (!usernameToFetch && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        usernameToFetch = storedUser.data.username;
      } catch (e) {
        logout();
        return;
      }
    }

    if (!usernameToFetch) {
      throw new Error("Nenhum usuário para atualizar.");
    }

    try {
      // Chama a API para pegar dados frescos (incluindo nova URL de imagem)
      // e validar se a sessão ainda existe
      const response = await userService.getUserDetails(usernameToFetch);
      
      // Se chegou aqui, o token/sessão é válido. Atualiza tudo.
      persistUser(response.data);
      
    } catch (error: any) {
      console.error("Sessão expirada ou erro ao atualizar usuário:", error);
      // Se der erro 401 (Não autorizado) ou 403 (Proibido), forçamos o logout
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
      throw error;
    }
  };

  // --- EFEITO DE INICIALIZAÇÃO (F5) ---
  useEffect(() => {
    const initAuth = async () => {
      const storedUserString = localStorage.getItem(USER_STORAGE_KEY);

      if (!storedUserString) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Carrega dados "velhos" do cache primeiro para a UI não piscar vazia
        const storedUser: UserDetails = JSON.parse(storedUserString);
        setUser(storedUser); 

        // 2. Imediatamente tenta revalidar com o backend
        // Isso garante que a imagem do S3 seja renovada e checa se o token expirou
        await userService.getUserDetails(storedUser.data.username)
          .then((response) => {
             // Sucesso: Atualiza com dados novos
             persistUser(response.data);
          })
          .catch((err) => {
             // Falha crítica de autenticação: Limpa tudo
             console.error("Falha na revalidação de sessão:", err);
             logout();
          });

      } catch (error) {
        // JSON corrompido ou erro grave
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string) => {
    setIsLoading(true);
    try {
      const response = await userService.getUserDetails(username);
      persistUser(response.data);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { user, isLoading, login, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};