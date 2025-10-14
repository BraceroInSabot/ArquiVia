import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      navigate("/painel");
    }
  }, [username, navigate]);

  return (
    <>
      <LoginForm login={useAuth().login} navigate={navigate} />
    </>
  );
};

export default LoginPage;