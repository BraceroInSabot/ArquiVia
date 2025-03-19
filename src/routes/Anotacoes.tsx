import "../assets/css/anotacoes.css";
import NavBar from "../components/NavBar";
import AnotacoesCartao from "../components/AnotacoesCartao";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";

import { useEffect } from "react";
import { Pagination } from "react-bootstrap";

function Anotacoes () {
    useEffect(() => {
        document.title = "Anotações - AnnotaPS";
    }, []);
    return (
        <>
            <NavBar logoImage={logo} userImage={logo} />

            <AnotacoesCartao />

            <div className="d-flex justify-content-center">
                <Pagination>
                    <Pagination.First />
                    <Pagination.Prev />
                    <Pagination.Item>{1}</Pagination.Item>
                    <Pagination.Ellipsis />

                    <Pagination.Item>{10}</Pagination.Item>
                    <Pagination.Item>{11}</Pagination.Item>
                    <Pagination.Item active>{12}</Pagination.Item>
                    <Pagination.Item>{13}</Pagination.Item>
                    <Pagination.Item disabled>{14}</Pagination.Item>

                    <Pagination.Ellipsis />
                    <Pagination.Item>{20}</Pagination.Item>
                    <Pagination.Next />
                    <Pagination.Last />
                </Pagination>
            </div>
        </>
    )
}

export default Anotacoes;