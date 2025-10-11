import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const goToRegisterPage = () => {
    navigate('/registrar');
  };
  return (
    <div>
      <label htmlFor="username">Usuário</label>
      <input type="text" name="username" id="username" />
      <label htmlFor="password">Senha</label>
      <input type="password" />
      <button>Entrar</button>
      <button onClick={goToRegisterPage}>Criar uma conta</button>
    </div>
  );
};

export default LoginPage;