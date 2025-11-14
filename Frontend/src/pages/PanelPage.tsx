import { useAuth } from "../contexts/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";

const PanelPage = () => {
  const { user } = useAuth();
  console.log("Usuário no PanelPage:", user?.data);

  return (
    <div>
      <div className="panel-page">
            {/* Substitui o Menu antigo por este */}
            <HamburgerMenu />
            
            <div className="panel-content">
                {/* O conteúdo do seu painel vai aqui */}
                <h1>Bem-vindo ao Painel</h1>
            </div>
        </div>
    </div>
  );
};

export default PanelPage;