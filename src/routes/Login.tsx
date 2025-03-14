import "../assets/css/login.css";
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useEffect } from "react";

function Login() {
    useEffect(() => {
        document.title = "Logar - AnnotaPS";
    }, []);
    return (
      <div className="divider">
        <div className="login-form">
          <div className="login-form-components">
            <Container className="w-80 d-flex justify-content-center"> 
              <Col>
                <img src="src\assets\img\logos\AnnotaPs-Logo-Medio-invertido.png" alt=""/>
                <Form className="text-left">
                  <Form.Group controlId="formBasicUsuario">
                      <Form.Label>Usuario</Form.Label>
                      <Form.Control className="p-2" type="text" id="usuario" placeholder="joao.silva" />
                  </Form.Group>
                  
                  <Form.Group className="mt-2" controlId="formBasicSenha">
                      <Form.Label>Senha</Form.Label>
                      <Form.Control type="password" placeholder="•••••••••" />
                  </Form.Group>
                </Form>

                <div className="erros" id="erros"></div>

                <div className="d-flex justify-content-center w-100 text-center mt-2">
                  <Button className="text-center w-100 p-1 login-button">
                    Entrar
                  </Button>
                </div>

                <div className="extra-options">
                  <a href="/esqueci-minha-senha">
                    Esqueci minha senha
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

export default Login
