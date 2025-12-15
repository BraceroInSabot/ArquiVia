import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import api from '../../services/core-api'; 
import { useAuth } from '../../contexts/AuthContext';

export const GoogleBtn = ({ isLogin }: { isLogin: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      const { access_token: googleToken } = tokenResponse;

      const response = await api.post('usuario/auth/google/', { 
        access_token: googleToken,
      });

      const { access_token, refresh_token, user } = response.data;

      if (!access_token || !user) {
        throw new Error("Resposta do servidor incompleta (falta token ou usuário).");
      }
      // 3. Loga no Contexto (que vai salvar como Bearer e normalizar o user)
      signIn(access_token, refresh_token, user);
      
      if (user.is_new_user) {
        toast("Cadastro inicializado! Complete seu perfil para continuar.", { icon: '📝' });

        navigate('/completar-perfil'); 
      } else {
        toast.success(`Bem-vindo de volta, ${user.name || user.username}!`);
        navigate('/painel');
      }

    } catch (error: any) {
      console.error("Erro Login Google:", error);
      const msg = error.response?.data?.detail || "Falha na autenticação.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => toast.error("Login cancelado."),
    flow: 'implicit',
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isLoading}
      className="btn w-full gap-2 bg-white text-gray-700 hover:bg-gray-50"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238986)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.449 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
            </svg>
            {isLogin ? "Entrar " : "Registrar " }
            com Google
        </div>
      )}
    </button>
  );
};