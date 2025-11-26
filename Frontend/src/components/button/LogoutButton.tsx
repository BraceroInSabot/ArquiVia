// src/components/LogoutButton.tsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/User/api'; 
import { LogOut } from 'lucide-react'; // Ícone opcional

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userService.logout(); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      logout();
      navigate('/entrar');
    }
  };

  return (
    <button 
        className="btn btn-outline btn-error w-full flex items-center gap-2" 
        onClick={handleLogout}
    >
      <LogOut size={18} />
      Sair da Conta
    </button>
  );
};

export default LogoutButton;