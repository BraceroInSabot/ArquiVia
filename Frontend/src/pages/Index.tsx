import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate(); 

  const goToLoginPage = () => {
    navigate('/entrar'); 
  };
  const goToRegisterPage = () => {
    navigate('/registrar')
  };

  return (
    <div>
      <h2>Página Inicial</h2>
      <p>Bem-vindo ao ArquiVia.</p>
      <button onClick={goToLoginPage}>Entrar</button>
      <button onClick={goToRegisterPage}>Registrar</button>
    </div>
  );
};

export default IndexPage;