import { Modal, Button, Alert } from "react-bootstrap";
import { desativarUsuario } from "../../api/apiHandler";
import { useState } from "react";

interface DesativarUsuarioModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void; // Nova prop para redirecionamento
}

function DesativarUsuarioModal({ show, onHide, onConfirm }: DesativarUsuarioModalProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Para exibir erro, se necessário

    const handleDesativarConta = async () => {
        try {
            const sucesso = await desativarUsuario(password);

            if (sucesso) {
                onConfirm(); // Redireciona para o login
            } else {
                setError("Não foi possível desativar a conta.");
            }
        } catch (error) {
            setError("Erro ao tentar desativar a conta.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Desativação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p>Para desativar a sua conta, insira sua senha:</p>
                <input 
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="senha-confirmacao"
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDesativarConta}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DesativarUsuarioModal;
