import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/painel");
    }
  }, [user, navigate]);

  const goToIndex = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity mb-2 no-underline hover:no-underline"
            onClick={goToIndex}
          >
            ArquiVia
          </h1>
          <p className="text-secondary/70">
            Crie sua conta para começar.
          </p>
        </div>
        
        {/* Register Card */}
        <div className="card bg-white shadow-xl border border-gray-100">
          <div className="card-body">
            <RegisterForm />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-secondary/70 text-sm">
            Já tem uma conta?{" "}
            <span 
              className="text-primary font-semibold cursor-pointer hover:underline"
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
