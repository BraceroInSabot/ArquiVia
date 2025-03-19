import NavBar from "../components/NavBar";
import SetorInformacao from "../components/SetorInformacao";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import "../assets/css/setor.css";

import { useEffect } from "react";

function Setor () {
    useEffect(() => {
        document.title = "Setor N2 - AnnotaPS";
    }, []);
    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />
            
            <SetorInformacao /> 

            <section className="busca-container">
                <input type="text" placeholder="Buscar por colaborador..."/>
            </section>           
        </>
    )
}

export default Setor;