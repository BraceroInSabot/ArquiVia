import "../../assets/css/AlterarSetor.css";
import { Modal, Button, Alert } from "react-bootstrap";
import { alterarSetor } from "../../api/apiHandler";
import { useState } from "react";

interface AlterarSetorUsuarioProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void; // Nova prop para redirecionamento
}

function AlterarSetorUsuarioModal({ show, onHide, onConfirm }: AlterarSetorUsuarioProps) {
    const [codigoChave, setCodigoChave] = useState("");
    const [codigoChave2, setCodigoChave2] = useState("");
    const [error, setError] = useState(""); // Para exibir erro, se necessário

    const validarCodigo = (codigo: string) => /^[A-Za-z]{3}[0-9]{3}$/.test(codigo);

    const handleAlterarUsuario = async () => {
        if (!validarCodigo(codigoChave) || !validarCodigo(codigoChave2)) {
            setError("Os códigos devem conter 3 letras seguidas de 3 números.");
            return;
        }

        try {
            const sucesso = await alterarSetor(codigoChave.toLowerCase(), codigoChave2.toLowerCase());

            if (sucesso) {
                onConfirm(); // Redireciona para o login
            } else {
                setError("Não foi possível alterar o setor da conta.");
            }
        } catch (error) {
            setError("Erro ao alterar o setor.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Alteração do Setor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p>Insira as Chaves requisitadas abaixo:</p>
                <div className="campos-input">
                    <input
                        type="text"
                        maxLength={6}
                        value={codigoChave}
                        onChange={(e) => setCodigoChave(e.target.value.toUpperCase())}
                        className="cc-atual"
                        placeholder="Ex: ABC123"
                    />
                    <input
                        type="text"
                        maxLength={6}
                        value={codigoChave2}
                        onChange={(e) => setCodigoChave2(e.target.value.toUpperCase())}
                        className="cc2-alvo"
                        placeholder="Ex: XYZ456"
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleAlterarUsuario}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AlterarSetorUsuarioModal;
