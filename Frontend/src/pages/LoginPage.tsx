import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/LoginForm";
import "../assets/css/LoginPage.css"; // CSS Específico

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) { 
      navigate("/painel");
    }
  }, [user, navigate]);

  const goToIndex = () => {
    navigate("/");
  }

  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="login-header mb-4 text-center">
          <h1 className="logo-text text-primary-custom fw-bold" onClick={goToIndex}>ArquiVia</h1>
          <p className="text-muted">Bem-vindo de volta! Acesse sua conta.</p>
        </div>
        
        <div className="login-card shadow-sm">
          <LoginForm login={login} navigate={navigate} />
        </div>

        <div className="login-footer text-center mt-4">
          <p className="text-muted small">
            Não tem uma conta? <span className="text-primary-custom fw-bold cursor-pointer" onClick={() => navigate('/registrar')}>Cadastre-se</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;