import NavBar from "../components/NavBar";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { useEffect } from "react";

function Setor () {
    useEffect(() => {
        document.title = "Setor N2 - AnnotaPS";
    }, []);
    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />
        </>
    )
}

export default Setor;