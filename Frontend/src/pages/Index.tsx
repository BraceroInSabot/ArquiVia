import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LogoutButton from "../components/LogoutButton";

const IndexPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate(); 

  const goToLoginPage = () => {
    navigate('/entrar'); 
  };
  const goToRegisterPage = () => {
    navigate('/registrar')
  };
  const goToIndexPage = () => {
    navigate('/menu')
  };


  return (
    <div>
      <h2>Página Inicial</h2>
      {username ? (
        <div>
          <p>Bem-vindo de volta, {username}!</p>
          <button onClick={goToIndexPage}>Acessar Painel</button>
          <LogoutButton />
        </div>
      ) : (
        <div>
          <p>Bem-vindo ao ArquiVia. Por favor, faça o login.</p>
          <button onClick={goToLoginPage}>Entrar</button>
          <button onClick={goToRegisterPage}>Registrar</button>
        </div>
      )}
    </div>
  );
};

export default IndexPage;