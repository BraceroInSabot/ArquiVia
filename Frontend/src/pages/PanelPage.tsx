import Menu from "../components/Menu";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../contexts/AuthContext";

const PanelPage = () => {
  const { user } = useAuth();
  console.log("Usuário no PanelPage:", user?.data);

  return (
    <div>
      {user ? (
        <div>
          <p>Olá, {user.data.name}!</p>
          <img width="100" height="100" src={user.data.image} alt={user.data.name} />
        </div>
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