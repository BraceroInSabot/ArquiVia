import "../../assets/css/AlterarSenha.css";
import { Modal, Button, Alert } from "react-bootstrap";
import { alterarSenha } from "../../api/apiHandler";
import { useState } from "react";
import { verificarsenha } from "../../tsx/verificacoes";

interface AlterarSenhaUsuarioProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
}

function AlterarSenhaUsuarioModal({ show, onHide, onConfirm }: AlterarSenhaUsuarioProps) {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const handleAlterarSenha = async () => {
        const validacoes = verificarsenha(novaSenha);
        const novosErros: string[] = [];

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            novosErros.push("Todos os campos são obrigatórios.");
        }

        if (validacoes.length > 0) {
            novosErros.push(...validacoes);
        }

        if (novaSenha !== confirmarSenha) {
            novosErros.push("A confirmação da senha não corresponde à nova senha.");
        }

        if (novosErros.length > 0) {
            setErrors(novosErros);
            return;
        }

        try {
            const sucesso = await alterarSenha(senhaAtual, novaSenha);

            if (sucesso) {
                onConfirm(); // Redireciona para login ou outra tela necessária
            } else {
                setErrors(["Não foi possível alterar a senha. Verifique se a senha atual está correta."]);
            }
        } catch (error) {
            setErrors(["Erro ao alterar a senha."]);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Alterar Senha</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errors.length > 0 && (
                    <div className="text-danger">
                        {errors.map((erro, index) => (
                            <Alert variant="danger" key={index}>{erro}</Alert>
                        ))}
                    </div>
                )}
                <p>Insira sua senha atual e defina uma nova senha:</p>
                <div className="campos-input-senhas">
                    <input
                        type="password"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        className="senha-atual"
                        placeholder="Senha atual"
                    />
                    <div className="novas-senhas">
                        <input
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="nova-senha"
                            placeholder="Nova senha"
                        />
                        <input
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className="confirmar-senha"
                            placeholder="Confirmar nova senha"
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleAlterarSenha}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AlterarSenhaUsuarioModal;
