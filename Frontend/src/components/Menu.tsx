import { useNavigate } from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate();
    
    const goToEnterprises = () => {
        navigate('/empresas');
    }
    
    return (
        <ul>
            <li><a onClick={goToEnterprises}>Empresas</a></li>
        </ul>
    )
}

export default Menu;