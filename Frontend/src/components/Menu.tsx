import { useNavigate } from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate();
    
    const goToEnterprises = () => {
        navigate('/empresas');
    }

    const goToSectors = () => {
        navigate('/setores');
    }

    const goToDocuments = () => {
        navigate('/documentos');
    }

    const goToProfile = () => {
        navigate('/perfil');
    }
    
    return (
        <ul>
            <li><a onClick={goToEnterprises}>Empresas</a></li>
            <li><a onClick={goToSectors}>Setores</a></li>
            <li><a onClick={goToDocuments}>Documentos</a></li>
            <li><a onClick={goToProfile}>Usuário / Perfil</a></li>
        </ul>
    )
}

export default Menu;