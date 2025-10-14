import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegisterPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (username) {
      navigate("/menu");
    }
  }, [username, navigate]);

  return (
    <div>
      <h2>Página de Cadastro</h2>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;