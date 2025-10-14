import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');

  const goToLoginPage = () => {
    navigate('/entrar'); 
  };

  return (
    <div>
      <h2>Página de Cadastro</h2>
      <form>
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

      <button onClick={goToLoginPage}>Já tenho uma conta</button>
    </div>
  );
};

export default RegisterPage;