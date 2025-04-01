import { useState, useEffect } from "react";
import { Button, Col, Container, Form, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { validar_token } from "../api/apiHandler";
import { verificarsenha } from "../tsx/verificacoes";
import "../assets/css/redefinicao_senha.css";
import {handlePasswordChange, verificarConfirmacaoSenha} from "../tsx/refinicao_senha";

function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const isValidToken = await validar_token(String(token));

      if (isValidToken) {
        setMessage("Token válido!");
        setIsValid(true);
      } else {
        setMessage("Token inválido ou expirado.");
        setIsValid(false);
      }
    };
    
    if (token) validateToken();
  }, [token]);

  useEffect(() => {
    verificarConfirmacaoSenha(password, cPassword);
  }, [cPassword]);

  if (!isValid) return (
  <>
    <Alert className="alert-token">{message}</Alert>
  </>);

  return (
    <div className="container">
      <div className="password-reset-div">
        <Container className="w-50 d-flex justify-content-center"> 
          <Col>
            <h2 className="password-reset-title">Redefinir Senha</h2>
            <Form className="password-reset-form">
              <Form.Group>
                <Form.Label>Nova Senha</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Digite sua nova senha"
                  aria-label="Nova senha"
                  onChange={(e) => {
                    verificarsenha();
                    setPassword(e.target.value);
                  }}
                  id="senha"
                  required
                />
                <div id="erros"></div>

                <Form.Label>Confirme sua Nova Senha</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Confirme sua nova senha"
                  aria-label="Confirme sua nova senha"
                  onChange={(e) => {
                    setCPassword(e.target.value);
                  }}
                  className={!confirmPassword ? "input-error" : "input-correct"}
                  required
                />
              </Form.Group>
            </Form>
            
            <div className="text-center button-container">
              <Button 
                onClick={(e) => {
                  handlePasswordChange(isValid, token, password, setMessage, navigate);
                }}
                className="w-100 text-center password-reset-button"
              >
                Alterar Senha
              </Button>
            </div>
          </Col>
        </Container>
      </div>
    </div>
  );
}

export default RedefinirSenha;