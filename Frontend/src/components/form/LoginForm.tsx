import React, { useState } from 'react';
import { User, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import userService from '../../services/User/api';
import { GoogleBtn } from '../../components/button/GoogleBtn';

interface LoginFormProps {
  login: (username: string) => Promise<void>;
  navigate: (path: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ login, navigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await userService.login({ username, password });
      await login(username);
      navigate('/painel');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Usuário ou senha inválidos.';
      setError(errorMessage);
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Username Field */}
      <div className="form-control">
        <label className="label" htmlFor="username">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Usuário
          </span>
          <span className="bg-base-000 border-r-0">
            <User className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="text"
            id="username"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Password Field */}
      <div className="form-control">
        <div className="label justify-between">
          <label htmlFor="password" className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Senha
          </label>
          <span className="bg-base-000 border-r-0">
            <Lock className="w-5 h-5 text-secondary/60" />
          </span>
        </div>
        <div className="relative">
          <label className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="input input-bordered w-full pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </label>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm h-auto min-h-0 p-1 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-secondary/60" />
            ) : (
              <Eye className="w-5 h-5 text-secondary/60" />
            )}
          </button>
        </div>
        <a 
            href="/solicitar-redefinicao-senha" 
            className="label-text-alt mt-2 text-primary hover:underline text-xs"
          >
            Esqueceu a senha?
          </a>
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button 
          type="submit" 
          className="btn btn-primary text-white w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Entrar
            </>
          )}
        </button>

        <div className="divider text-xs text-gray-400">OU</div>

        <GoogleBtn isLogin={true} />  
      </div>
    </form>
  );
};

export default LoginForm;
