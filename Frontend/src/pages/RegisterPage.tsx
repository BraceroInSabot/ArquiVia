import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/RegisterForm";
import '../assets/css/LoginPage.css'; // Reutiliza o CSS do Login

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/painel");
    }
  }, [user, navigate]);

  return (
    <div className="login-page-container">
      <div className="login-content">
        
        {/* Cabeçalho */}
        <div className="login-header mb-4 text-center">
          <h1 className="logo-text text-primary-custom fw-bold">ArquiVia</h1>
          <p className="text-muted">Crie sua conta para começar.</p>
        </div>
        
        {/* Card do Formulário */}
        <div className="login-card shadow-sm">
          <RegisterForm />
        </div>

        {/* Rodapé */}
        <div className="login-footer text-center mt-4">
          <p className="text-muted small">
            Já tem uma conta?{' '}
            <span 
              className="text-primary-custom fw-bold cursor-pointer" 
              onClick={() => navigate('/entrar')}
            >
              Faça login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;