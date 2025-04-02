import { useEffect, useState } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { alterarDadosUsuario } from "../../api/apiHandler";

interface AlterarDadosUsuarioProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    nomeAtual: string;
    emailAtual: string;
}

function AlterarDadosUsuarioModal({ show, onHide, onConfirm, nomeAtual, emailAtual }: AlterarDadosUsuarioProps) {
    const [nome, setNome] = useState(nomeAtual);
    const [email, setEmail] = useState(emailAtual);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setNome(nomeAtual);
        setEmail(emailAtual);
    }, [nomeAtual, emailAtual]);

    const handleAlterarDados = async () => {
        setError(null);
        try {
            const sucesso = await alterarDadosUsuario({ nome, email });
            if (sucesso) {
                onConfirm();
                window.location.reload();
            } else {
                setError("Não foi possível alterar os dados. Verifique as informações e tente novamente.");
            }
        } catch (error) {
            setError("Erro ao alterar os dados do usuário.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Alterar Dados do Usuário</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group controlId="formNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="mt-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleAlterarDados}>Salvar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AlterarDadosUsuarioModal;
