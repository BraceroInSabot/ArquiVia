import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/User/api'; 
// O CSS já está sendo carregado pelo componente Pai (Menu), 
// mas se quiser garantir, pode importar aqui também.

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
    <button className="logout-btn" onClick={handleLogout}>
      {/* Se tiver um ícone de porta/sair, pode colocar aqui */}
      Sair da Conta
    </button>
  );
};

export default LogoutButton;