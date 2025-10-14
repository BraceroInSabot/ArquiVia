import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/User/api';
import type { RegisterCredentials } from '../services/core-api';
import Validate from '../utils/credential_validation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  
  // 1. Estado para armazenar e exibir a mensagem de erro na tela
  const [error, setError] = useState<string | null>(null);

  const goToLoginPage = () => {
    navigate('/entrar');
  };

  // 2. A lógica agora está no onSubmit do formulário
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    // 3. Previne o recarregamento da página
    event.preventDefault();
    setError(null); // Limpa erros anteriores

    // 4. Validação mais eficiente (chamando cada função apenas uma vez)
    const usernameValidation = Validate.username(username);
    if (!usernameValidation[0]) {
      setError(usernameValidation[1]);
      return;
    }
    const nameValidation = Validate.name(name);
    if (!nameValidation[0]) {
      setError(nameValidation[1]);
      return;
    }
    const emailValidation = Validate.email(email);
    if (!emailValidation[0]) {
      setError(emailValidation[1]);
      return;
    }
    const passwordValidation = Validate.password(password, cpassword);
    if (!passwordValidation[0]) {
      setError(passwordValidation[1]);
      return;
    }

    const userData: RegisterCredentials = { username, name, email, password, cpassword };

    try {
      const api_response = await userService.register(userData);
      console.log('Registro bem-sucedido:', api_response.data);
      alert('Registro realizado com sucesso!');
      navigate('/entrar');
    } catch (err: any) {
      const errorMessage = err.response?.data?.mensagem || 'Erro ao registrar usuário.';
      // 5. Exibe o erro na tela em vez de usar alert()
      setError(errorMessage);
    }
  }

  return (
    <div>
      <h2>Página de Cadastro</h2>
      {/* 6. O evento é controlado aqui */}
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="name">Nome Completo:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="cpassword">Confirme a Senha:</label>
          <input
            type="password"
            id="cpassword"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
          />
        </div>
        <br />
        {/* 7. O botão apenas submete o formulário, sem onClick */}
        <button type="submit">Cadastrar</button>
      </form>

      {/* 8. Exibindo a mensagem de erro de forma clara */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 9. Botão com type="button" para garantir que ele não submeta o formulário */}
      <button type="button" onClick={goToLoginPage}>Já tenho uma conta</button>
    </div>
  );
};

export default RegisterPage;