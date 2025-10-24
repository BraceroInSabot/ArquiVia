import { useNavigate } from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate();
    
    const goToEnterprises = () => {
        navigate('/empresas');
    }

    const goToSectors = () => {
        navigate('/setores');
    }
    
    return (
        <ul>
            <li><a onClick={goToEnterprises}>Empresas</a></li>
            <li><a onClick={goToSectors}>Setores</a></li>
        </ul>
    )
}

export default Menu;