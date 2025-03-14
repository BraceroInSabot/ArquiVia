import "../assets/css/registrar.css";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { verificarusuario, verificaremail, verificarsenha, verificarconfirmarsenha } from '../tsx/verificacoes';
import 'bootstrap/dist/css/bootstrap.min.css';


function Registrar() {

    useEffect(() => {
        document.title = "Registrar - AnnotaPS";
    }, []);

    return (
        <div className="container">
            <div className="central-div">
                <img src="src\assets\img\logos\AnnotaPs-Logo-Medio-invertido.png" alt="Logo Precisão" />

                <Container className="w-50 d-flex justify-content-center"> 
                    <Col>
                        <Form className="text-left">
                            <Form.Group controlId="formBasicUsuario">
                                <Form.Label>Usuario</Form.Label>
                                <Form.Control type="text" onChange={verificarusuario} id="usuario" placeholder="joao.silva" />
                            </Form.Group>
                            
                            <Form.Group className="mt-2" controlId="formBasicNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" placeholder="João Silva" />
                            </Form.Group>
                            
                            <Form.Group className="mt-2" controlId="formBasicEmail">
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control type="email" onChange={verificaremail} id="email" placeholder="joao.silva@inovafarma.com.br" />
                            </Form.Group>

                            <Form.Group className="mt-2" controlId="formBasicSenha">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control type="password" onChange={verificarsenha} id="senha" placeholder="•••••••••" />
                            </Form.Group>

                            <div id="erros"></div>

                            <Form.Group className="mt-2" controlId="formBasicSenhaConfirmar">
                                <Form.Label>Confirmar Senha</Form.Label>
                                <Form.Control type="password" onChange={verificarconfirmarsenha} id="confirmar-senha" placeholder="•••••••••" />
                            </Form.Group>

                            <Form.Group className="mt-2" controlId="formBasicCodigoSetor">
                                <Form.Label>Código Setor</Form.Label>
                                <Form.Control type="text" placeholder="123456" />
                            </Form.Group>
                        </Form>
                        
                        <div className="text-center">
                            <Button className="w-100 text-center register-button">Cadastrar</Button>
                            <p className="mt-2">Já possui uma conta? <a href="/login" className="text-decoration-none">Entrar</a></p>
                        </div>
                    </Col>
                </Container>
            </div>
        </div>
    )
}

export default Registrar
