import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/User/api'; 

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userService.logout(); 
    } catch (error) {
    } finally {
      logout();
      navigate('/entrar');
    }
  };

  return (
    <button onClick={handleLogout}>
      Sair da Conta
    </button>
  );
};

export default LogoutButton;