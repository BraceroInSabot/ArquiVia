import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Validate from '../utils/credential_validation';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const goToLoginPage = () => {
    navigate('/entrar');
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 

    const usernameValidation = Validate.username(username);
    if (!usernameValidation[0]) {
      setError(usernameValidation[1] as string);
      return;
    }
    const nameValidation = Validate.name(name);
    if (!nameValidation[0]) {
      setError(nameValidation[1] as string);
      return;
    }
    const emailValidation = Validate.email(email);
    if (!emailValidation[0]) {
      setError(emailValidation[1] as string);
      return;
    }
    const passwordValidation = Validate.password(password, cpassword);
    if (!passwordValidation[0]) {
      setError(passwordValidation[1] as string);
      return;
    }

    try {
      alert('Registro realizado com sucesso!');
      navigate('/entrar');
    } catch (err: any) {
      const errorMessage = err.response?.data?.mensagem || 'Erro ao registrar usuário.';
      setError(errorMessage);
    }
  }
    return (
        <div>
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
        <button type="submit">Cadastrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="button" onClick={goToLoginPage}>Já tenho uma conta</button>
    </div>
    )
}

export default RegisterForm;