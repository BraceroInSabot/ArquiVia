import "../assets/css/login.css";
import { useState, useEffect } from "react";
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { esqueci_senha } from "../api/apiHandler";

function EsqueciSenha() {
    const [emailUsuario, setEmailUsuario] = useState("");
    const [emailGestor, setEmailGestor] = useState("");

    const handleEsqueciSenha = () => {
      esqueci_senha({emailUsuario, emailGestor});
      console.log('ENVIADO!')
    }

    useEffect(() => {
        document.title = "Esqueci minha senha - AnnotaPS";
    }, []);
    return (
      <div className="divider">
        <div className="login-form">
          <div className="login-form-components">
            <Container>
              <Col>
                <div className="logo-container">
                  <img src="src\assets\img\logos\AnnotaPs-Logo-Medio-invertido.png" alt="" width="148px" height="40px"/>
                </div>
                <Form className="text-left">
                  <Form.Group controlId="formBasicEmail">
                      <Form.Label>Insira o seu E-mail</Form.Label>
                      <Form.Control 
                      type="email" 
                      id="email-proprio" 
                      onChange={(e) => {
                        setEmailUsuario(e.target.value)
                      }}
                      placeholder="joao.silva@inovafarma.com.br" />
                  </Form.Group>
                  
                  <Form.Group className="mt-2" controlId="formBasicEmailGestor">
                      <Form.Label>Insira o E-mail do seu Gestor</Form.Label>
                      <Form.Control 
                      type="email"
                      onChange={(e) => {
                        setEmailGestor(e.target.value)
                      }} 
                      placeholder="maria.gestora@inovafarma.com.br" />
                  </Form.Group>
                </Form>
                
                <div className="erros" id="erros"></div>
                
                <div>
                  <Button 
                  onClick={handleEsqueciSenha}
                  className="w-100 p-1 login-button">
                    Solicitar Redefinição de Senha
                  </Button>
                </div>

                <div className="extra-options mt-2">
                  <a href="/login">
                    Entrar
                  </a>
                  <a href="/registrar">
                    Cadastrar
                  </a>
                </div>
              </Col>
            </Container>
          </div>
        </div>
        <div className="img-container">
          
        </div>
      </div>
    )
}

export default EsqueciSenha
