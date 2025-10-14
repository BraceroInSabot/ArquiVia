import { useAuth } from "../contexts/AuthContext";

const EnterpriseIndexPage = () => {
  const { username } = useAuth();

  return (
    <div>
      {username ? (
        <p>Olá, {username}!</p>
      ) : (
        <p>Por favor, faça o login.</p>
      )}
      <h1>Tela de empresa, somente para usuário logado.</h1>
    </div>
  );
};

export default EnterpriseIndexPage;