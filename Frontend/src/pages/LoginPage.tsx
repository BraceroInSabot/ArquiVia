import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) { 
      navigate("/painel");
    }
  }, [user, navigate]);

  return (
    <>
      <LoginForm login={login} navigate={navigate} />
    </>
  );
};

export default LoginPage;