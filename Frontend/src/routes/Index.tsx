import "../assets/css/index.css";
import NavBar from "../components/NavBar";
import IndexCards from "../components/IndexCards";
import Estatisticas from "../components/Estatisticas";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { useEffect } from "react";
import { Button } from 'react-bootstrap';
import figura1 from "../assets/img/etc/figura1.png";
import figura2 from "../assets/img/etc/figura2.png";

function Index() {
    useEffect(() => {
        document.title = "AnnotaPS";
    }, []);

    return (
        <>
            
        </>
    )

}

export default Index;