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
    
    return (
        <ul>
            <li><a onClick={goToEnterprises}>Empresas</a></li>
            <li><a onClick={goToSectors}>Setores</a></li>
            <li><a onClick={goToDocuments}>Documentos</a></li>
        </ul>
    )
}

export default Menu;