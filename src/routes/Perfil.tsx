import "../assets/css/perfil.css";
import NavBar from "../components/NavBar";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";

function Perfil () {
    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />
        </>
    )
}

export default Perfil;