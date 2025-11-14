import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import '../assets/css/Menu.css'; // Importe o CSS criado

const Menu = () => {
    const navigate = useNavigate();
    
    const goToEnterprises = () => navigate('/empresas');
    const goToSectors = () => navigate('/setores');
    const goToDocuments = () => navigate('/documentos');
    const goToProfile = () => navigate('/perfil');
    
    return (
        <div className="menu-container">
            {/* Lista de Navegação */}
            <ul className="menu-list">
                <li>
                    <span className="menu-item" onClick={goToEnterprises}>
                        Empresas
                    </span>
                </li>
                <li>
                    <span className="menu-item" onClick={goToSectors}>
                        Setores
                    </span>
                </li>
                <li>
                    <span className="menu-item" onClick={goToDocuments}>
                        Documentos
                    </span>
                </li>
                <li>
                    <span className="menu-item" onClick={goToProfile}>
                        Meu Perfil
                    </span>
                </li>
            </ul>

            {/* Rodapé com Botão de Sair */}
            <div className="menu-footer">
                <LogoutButton/>
            </div>
        </div>
    )
}

export default Menu;