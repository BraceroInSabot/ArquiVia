import "../assets/css/index.css";
import NavBar from "../components/NavBar";
import IndexCards from "../components/IndexCards";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { useEffect } from "react";
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import figura1 from "../assets/img/etc/figura1.png";
import figura2 from "../assets/img/etc/figura2.png";

function Index() {
    useEffect(() => {
        document.title = "AnnotaPS";
    }, []);

    return (
        <>
            <nav>
                <NavBar logoImage={logo} userImage={logo} />
            </nav>
            
            <section>
                <h1 className="text-center mb-4 titulo">Vistos Recentementes</h1>

                <IndexCards />
                
                <div className="d-flex justify-content-center mt-4">
                    <Button className="vermais">
                        Ver mais
                    </Button>
                </div>
            </section>

            <section>
                <div className="metricas-intro">
                    <div className="figura" id="figura1">
                        <img src={figura1} alt="" />
                    </div>
                    
                    <div className="metricas-texto">
                        <h1 className="titulo">Métricas do Setor</h1>
                        <p>Acompanhe a contabilização das documentações e anotações realizadas pelo seu setor!</p>
                    </div>

                    <div className="figura" id="figura2">
                        <img src={figura2} alt="" />
                    </div>

                </div>
            </section>
        </>
    )

}

export default Index;