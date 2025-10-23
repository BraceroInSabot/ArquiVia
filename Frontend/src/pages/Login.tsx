import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const { username, login } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      navigate("/painel");
    }
  }, [username, navigate]);

  return (
    <>
      <LoginForm login={login} navigate={navigate} />
    </>
  );
};

export default LoginPage;