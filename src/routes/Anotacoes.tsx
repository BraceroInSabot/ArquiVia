import "../assets/css/anotacoes.css";
import NavBar from "../components/NavBar";
import AnotacoesCartao from "../components/AnotacoesCartao";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";

import { useEffect } from "react";

function Anotacoes () {
    useEffect(() => {
        document.title = "Anotações - AnnotaPS";
    }, []);
    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />

            <AnotacoesCartao />
        </>
    )
}

export default Anotacoes;