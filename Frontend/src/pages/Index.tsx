import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate(); 

  const goToLoginPage = () => {
    navigate('/login'); 
  };

  return (
    <div>
      <h2>Página Inicial</h2>
      <p>Bem-vindo ao ArquiVia.</p>
      <button onClick={goToLoginPage}>Entrar</button>
      <button>Registrar</button>
    </div>
  );
};

export default IndexPage;