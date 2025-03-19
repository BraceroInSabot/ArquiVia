import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import editar from "../assets/img/icons/Editar.svg"
import eliminar from "../assets/img/icons/Eliminar.svg"
import alterar from "../assets/img/icons/AlterarSenha.svg"
import liderIcone from "../assets/img/icons/lider.svg";
import "../assets/css/SetorQuadroColaborador.css";
import { Button } from "react-bootstrap";

function SetorQuadroColaborador () {
    return (
        <section className="quadro">
            <div className="quadro-colaborador">
                <div className="quadro-cartao">
                    <div>
                        <img src={logo} className="quadro-imagem-colaborador" alt="Guilherme Bracero" />
                    </div>
                    <div className="quadro-informacoes">
                        <div className="quadro-nome">
                            <h2>Guilherme Bracero Gonzales</h2>
                            <img src={liderIcone} alt="Administrador" />
                        </div>
                        <span>Anotações: 10</span>
                        <span>Documentações: 15</span>

                        <div className="quadro-botoes">
                            <Button className="quadro-botao-editar">
                                <img src={editar} alt="Editar" />
                            </Button>
                            <Button className="quadro-botao-eliminar">
                                <img src={eliminar} alt="Eliminar" />
                            </Button>
                            <Button className="quadro-botao-alterar-senha">
                                <img src={alterar} alt="Alterar Senha" />
                            </Button>
                        </div>      
                    </div>
                </div><div className="quadro-cartao">
                    <div>
                        <img src={logo} className="quadro-imagem-colaborador" alt="Guilherme Bracero" />
                    </div>
                    <div className="quadro-informacoes">
                        <div className="quadro-nome">
                            <h2>Guilherme Bracero Gonzales</h2>
                            <img src={liderIcone} alt="Administrador" />
                        </div>
                        <span>Anotações: 10</span>
                        <span>Documentações: 15</span>

                        <div className="quadro-botoes">
                            <Button className="quadro-botao-editar">
                                <img src={editar} alt="Editar" />
                            </Button>
                            <Button className="quadro-botao-eliminar">
                                <img src={eliminar} alt="Eliminar" />
                            </Button>
                            <Button className="quadro-botao-alterar-senha">
                                <img src={alterar} alt="Alterar Senha" />
                            </Button>
                        </div>      
                    </div>
                </div><div className="quadro-cartao">
                    <div>
                        <img src={logo} className="quadro-imagem-colaborador" alt="Guilherme Bracero" />
                    </div>
                    <div className="quadro-informacoes">
                        <div className="quadro-nome">
                            <h2>Guilherme Bracero Gonzales</h2>
                            <img src={liderIcone} alt="Administrador" />
                        </div>
                        <span>Anotações: 10</span>
                        <span>Documentações: 15</span>

                        <div className="quadro-botoes">
                            <Button className="quadro-botao-editar">
                                <img src={editar} alt="Editar" />
                            </Button>
                            <Button className="quadro-botao-eliminar">
                                <img src={eliminar} alt="Eliminar" />
                            </Button>
                            <Button className="quadro-botao-alterar-senha">
                                <img src={alterar} alt="Alterar Senha" />
                            </Button>
                        </div>      
                    </div>
                </div><div className="quadro-cartao">
                    <div>
                        <img src={logo} className="quadro-imagem-colaborador" alt="Guilherme Bracero" />
                    </div>
                    <div className="quadro-informacoes">
                        <div className="quadro-nome">
                            <h2>Guilherme Bracero Gonzales</h2>
                            <img src={liderIcone} alt="Administrador" />
                        </div>
                        <span>Anotações: 10</span>
                        <span>Documentações: 15</span>

                        <div className="quadro-botoes">
                            <Button className="quadro-botao-editar">
                                <img src={editar} alt="Editar" />
                            </Button>
                            <Button className="quadro-botao-eliminar">
                                <img src={eliminar} alt="Eliminar" />
                            </Button>
                            <Button className="quadro-botao-alterar-senha">
                                <img src={alterar} alt="Alterar Senha" />
                            </Button>
                        </div>      
                    </div>
                </div><div className="quadro-cartao">
                    <div>
                        <img src={logo} className="quadro-imagem-colaborador" alt="Guilherme Bracero" />
                    </div>
                    <div className="quadro-informacoes">
                        <div className="quadro-nome">
                            <h2>Guilherme Bracero Gonzales</h2>
                            <img src={liderIcone} alt="Administrador" />
                        </div>
                        <span>Anotações: 10</span>
                        <span>Documentações: 15</span>

                        <div className="quadro-botoes">
                            <Button className="quadro-botao-editar">
                                <img src={editar} alt="Editar" />
                            </Button>
                            <Button className="quadro-botao-eliminar">
                                <img src={eliminar} alt="Eliminar" />
                            </Button>
                            <Button className="quadro-botao-alterar-senha">
                                <img src={alterar} alt="Alterar Senha" />
                            </Button>
                        </div>      
                    </div>
                </div>
            </div>
        </section>
    ) 
}

export default SetorQuadroColaborador;