import liderIcone from "../assets/img/icons/lider.svg";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import "../assets/css/SetorInformacao.css";
import { Button } from "react-bootstrap";

function SetorInformacao () {
    
    return (<section>
                <div className="setor">
                    <div className="setor-container">
                        <img src={logo} alt="Imagem do Setor" />

                        <div className="setor-informacoes">
                            <h1>SETOR NIVEL 2</h1>
                            <div className="setor-lider">
                                <img src={liderIcone} alt="Logo líder" />
                                <span>Tamara Victor Rodrigues</span>
                            </div>
                            <div className="setor-metadados">
                                <span>Anotações: 100</span>
                                <span>Documentações: 200</span>
                            </div>
                        </div>
                    </div>
                    <div className="setor-chave">
                        <span>Código Chave: XXX111</span>
                        <Button>Modelos de Documentações</Button>
                    </div>
                </div>

            </section>
)}

export default SetorInformacao;