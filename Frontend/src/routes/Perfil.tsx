import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import NavBar from "../components/NavBar";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { verificar_dados_usuario } from "../api/apiHandler";
import DesativarUsuarioModal from "../components/Modals/DesativarUsuario";
import AlterarSetorUsuarioModal from "../components/Modals/AlterarSetor";
import AlterarSenhaUsuarioModal from "../components/Modals/AlterarSenha"; // Importa o modal de senha
import { useNavigate } from "react-router";
import "../assets/css/perfil.css";

interface UsuarioInterface {
    nome: string;
    setor: string;
    email: string;
    data_criacao: string;
    ultimo_login: string;
    inicio_expediente: string;
    final_expediente: string;
}

function Perfil() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState<UsuarioInterface | null>(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showUpdateSetorModal, setShowUpdateSetorModal] = useState(false);
    const [showUpdateSenhaModal, setShowUpdateSenhaModal] = useState(false); // Estado do modal de senha

    useEffect(() => {
        document.title = "Perfil - AnnotaPS";

        const fetchData = async () => {
            const dadosUsuario = await verificar_dados_usuario();
            setUsuario(dadosUsuario['usuario'][0]);
        };

        fetchData();
    }, []);

    const deactivateModal = () => {
        setShowDeactivateModal(false);
        navigate('/login'); // Redireciona para login
    };

    const updateSetorModal = () => {
        setShowUpdateSetorModal(false);
        navigate('/login');
    };

    const updateSenhaModal = () => {
        setShowUpdateSenhaModal(false);
        navigate('/login'); // Redireciona para login após alterar a senha
    };

    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />

            <section>
                <div className="perfil-container">
                    <img src={logo} alt="Perfil do Usuário" />
                    <div className="perfil-dados">
                        <div className="perfil-textos">
                            <h1>{ usuario?.nome }</h1>
                            <h2>{ usuario?.setor }</h2>

                            <div className="perfil-datas">
                                <span>Conta criada em { usuario?.data_criacao }</span>
                                <span>Última vez logado em { usuario?.ultimo_login }</span>
                            </div>

                            <div className="perfil-informacoes">
                                <span>{ usuario?.email }</span><br />
                                <span>Inicia o expediente em: { usuario?.inicio_expediente || "--:--" }</span><br />
                                <span>Termina o expediente em: { usuario?.final_expediente || "--:--" }</span>
                            </div>
                        </div>
                        <div className="perfil-botoes">
                            <Button 
                                className="botao-desativar-conta" 
                                onClick={() => setShowDeactivateModal(true)}
                            >
                                Desativar Conta
                            </Button>

                            <div className="perfil-botoes-alterar">
                                <Button 
                                    className="botao-alterar-setor"
                                    onClick={() => setShowUpdateSetorModal(true)}
                                >
                                    Alterar Setor
                                </Button>
                                <Button 
                                    className="botao-alterar-senha"
                                    onClick={() => setShowUpdateSenhaModal(true)} // Abre o modal de senha
                                >
                                    Alterar Senha
                                </Button>
                                <Button className="botao-alterar-dados">Alterar Dados</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MODAIS */}
            <DesativarUsuarioModal 
                show={showDeactivateModal} 
                onHide={() => setShowDeactivateModal(false)} 
                onConfirm={deactivateModal} 
            />
            <AlterarSetorUsuarioModal
                show={showUpdateSetorModal}
                onHide={() => setShowUpdateSetorModal(false)}
                onConfirm={updateSetorModal}
            />
            <AlterarSenhaUsuarioModal
                show={showUpdateSenhaModal}
                onHide={() => setShowUpdateSenhaModal(false)}
                onConfirm={updateSenhaModal}
            />
        </>
    );
}

export default Perfil;
