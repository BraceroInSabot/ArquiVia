import Menu from "../components/Menu";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../contexts/AuthContext";

const PanelPage = () => {
  const { username } = useAuth();

  return (
    <div>
      {username ? (
        <p>Olá, {username}!</p>
      ) : (
        <p>Por favor, faça o login.</p>
      )}
      <h1>Tela de empresa, somente para usuário logado.</h1>
      <Menu />
      <LogoutButton />
    </div>
  );
};

export default PanelPage;