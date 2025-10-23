import { useState } from 'react';
import { type NavigateFunction } from 'react-router-dom';
import userService from '../services/User/api';

interface LoginFormProps {
  login: (name: string) => void;
  navigate: NavigateFunction | ((path: string) => void);
}
const LoginForm = ({ login, navigate }: LoginFormProps) => {
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
            const api_response = await userService.login({ username, password });
            // Só avança se a requisição for bem-sucedida
            login(username);
            navigate('/painel');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Usuário ou senha inválidos.';
            setError(errorMessage);
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
    )
}

export default LoginForm;