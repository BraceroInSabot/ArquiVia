import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "../../components/form/LoginForm";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const goToIndex = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity mb-2"
            onClick={goToIndex}
          >
            ArquiVia
          </h1>
          <p className="text-secondary/70">
            Bem-vindo de volta! Acesse sua conta.
          </p>
        </div>
        
        {/* Login Card */}
        <div className="card bg-white shadow-xl border border-gray-100">
          <div className="card-body">
            <LoginForm login={login} navigate={navigate} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-secondary/70 text-sm">
            Não tem uma conta?{" "}
            <span 
              className="text-primary font-semibold cursor-pointer hover:underline"
              onClick={() => navigate('/registrar')}
            >
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
