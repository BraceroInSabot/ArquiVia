import "../assets/css/perfil.css";
import NavBar from "../components/NavBar";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { useEffect } from "react";
import { Button } from "react-bootstrap";

function Perfil () {

    useEffect(() => {
            document.title = "Guilherme Bracero - AnnotaPS";
        }, []);

    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />

            <section>
                <div className="perfil-container">
                    <img src={logo} alt="Perfil do Usuário" />
                    <div className="perfil-dados">
                        <div className="perfil-textos">
                            <h1>Guilherme Bracero Gonzales</h1>
                            <h2>Setor N2</h2>

                            <div className="perfil-datas">
                                <span>Conta criada em 21 de fev, 2025.</span>
                                <span>Última vez logado em 24 de fev, 2025.</span>
                            </div>

                            <div className="perfil-informacoes">
                                <span>guibragon@gmail.com</span><br />
                                <span>Inicia o expediente em: 13h00</span><br />
                                <span>Termina o expediente em: 22h00</span>
                            </div>
                        </div>
                        <div className="perfil-botoes">
                            <Button className="botao-desativar-conta">Desativar Conta</Button>

                            <div className="perfil-botoes-alterar">
                                <Button className="botao-alterar-setor">Alterar Setor</Button>
                                <Button className="botao-alterar-senha">Alterar Senha</Button>
                                <Button className="botao-alterar-dados">Alterar Dados</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </>
    )
}

export default Perfil;