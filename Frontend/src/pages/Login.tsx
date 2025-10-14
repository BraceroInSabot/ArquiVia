// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/User/api'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToRegisterPage = () => {
    navigate('/registrar');
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const api_response = await userService.login({username, password})

      console.log('Login bem-sucedido:', api_response.data);
      navigate('/menu');

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Usuário ou senha inválidos.';
      setError(errorMessage);
      console.error('Erro no login:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <h2>Login</h2>
        <label htmlFor="username">Usuário</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={goToRegisterPage}>
          Criar uma conta
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </form>
  );
};

export default LoginPage;