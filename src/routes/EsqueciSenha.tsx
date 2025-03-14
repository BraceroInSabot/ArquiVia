import "../assets/css/login.css";
import { useEffect } from "react";
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

function EsqueciSenha() {
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
                      <Form.Control type="email" id="email-proprio" placeholder="joao.silva@inovafarma.com.br" />
                  </Form.Group>
                  
                  <Form.Group className="mt-2" controlId="formBasicEmailGestor">
                      <Form.Label>Insira o E-mail do seu Gestor</Form.Label>
                      <Form.Control type="email" placeholder="maria.gestora@inovafarma.com.br" />
                  </Form.Group>
                </Form>
                
                <div className="erros" id="erros"></div>
                
                <div>
                  <Button className="w-100 p-1 login-button">
                    Solicitar Senha
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
