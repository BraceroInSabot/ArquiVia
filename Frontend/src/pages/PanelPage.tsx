import Menu from "../components/Menu";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../contexts/AuthContext";

const PanelPage = () => {
  const { user } = useAuth();

  return (
    <div>
      {user ? (
        //@ts-ignore
        <p>Olá, {user.data.name}!</p>
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