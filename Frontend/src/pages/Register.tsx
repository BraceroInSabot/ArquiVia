import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/painel");
    }
  }, [user, navigate]);

  return (
    <div>
      <h2>Página de Cadastro</h2>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;