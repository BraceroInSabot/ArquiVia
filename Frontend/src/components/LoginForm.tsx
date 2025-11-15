import React, { useState } from 'react';
import { User, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import userService from '../services/User/api';
import '../assets/css/LoginPage.css'; // Reutiliza o CSS da página

interface LoginFormProps {
  login: (username: string) => Promise<void>; // Ajuste a tipagem conforme sua função login real (ex: username, password)
  navigate: (path: string) => void;
}

//@ts-ignore
const LoginForm: React.FC<LoginFormProps> = ({ login, navigate }) => {
  // Nota: Se sua função de login exigir senha, adicione o estado aqui.
  // Baseado no seu código anterior, o login parecia pedir apenas username, 
  // mas vou adicionar o campo de senha visualmente para completar o layout padrão.
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Adicionado para UI
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
        } 

    try {
      // Chama a função de login do contexto
      // (Ajuste se o seu 'login' aceitar password)
      await login(username); 
      
      // O redirecionamento é feito pelo useEffect da LoginPage, 
      // mas podemos forçar ou deixar o fluxo natural.
    } catch (err) {
      console.error(err);
      setError("Falha no login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      
      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center p-2 small mb-3" role="alert">
          <AlertCircle className="me-2 flex-shrink-0" size={16} />
          <div>{error}</div>
        </div>
      )}

      {/* Campo Usuário */}
      <div className="mb-3">
        <label htmlFor="username" className="form-label small fw-bold text-secondary text-uppercase">Usuário</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted">
            <User size={18} />
          </span>
          <input
            type="text"
            id="username"
            className="form-control border-start-0 ps-0 bg-light"
            placeholder="Seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            tabIndex={1}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="password" className="form-label small fw-bold text-secondary text-uppercase mb-1">Senha</label>
            <a href="/solicitar-redefinicao-senha" className="small text-decoration-none text-primary-custom" tabIndex={4}>Esqueceu a senha?</a>
        </div>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted">
            <Lock size={18} />
          </span>
          <input
            type="password"
            id="password"
            className="form-control border-start-0 ps-0 bg-light"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            tabIndex={2}
          />
        </div>
      </div>

      {/* Botão Entrar */}
      <button 
        type="submit" 
        className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
        disabled={isLoading}
        tabIndex={3}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Entrando...
          </>
        ) : (
          <>
            <LogIn size={20} />
            Entrar
          </>
        )}
      </button>

    </form>
  );
};

export default LoginForm;