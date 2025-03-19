import "../assets/css/AnotacoesCartao.css";
import { Button } from "react-bootstrap";

function AnotacoesCartao () {  
    return (
        <section className="anotacoes-cartao">
            <div className="a-c-filtragem">
                <input type="text" />

                <label htmlFor="opcoes">Procurar no:</label>

                <div className="opcoes-checkbox">
                    <input type="checkbox" id="opcoes" /> Titulo
                    <input type="checkbox" id="opcoes" /> Conteúdo
                </div>

                <label htmlFor="S1Nivel">Serviço de 1º Nível</label>
                <input type="text" id="S1Nivel" />

                <label htmlFor="S2Nivel">Serviço de 2º Nível</label>
                <input type="text" id="S2Nivel" />

                <label htmlFor="urgencia">Urgência</label>
                <select className="form-select opcoes-select" aria-label="Default select example">
                    <option selected>Todas</option>
                    <option value="1">Baixa</option>
                    <option value="2">Média</option>
                    <option value="3">Alta</option>
                    <option value="4">Faturamento Inoperante</option>
                </select>

                <label htmlFor="nivel">Nível</label>
                <select className="form-select opcoes-select" aria-label="Default select example">
                    <option selected>Todas</option>
                    <option value="1">Nível 1</option>
                    <option value="2">Nível 2</option>
                    <option value="3">Nível 3</option>
                </select>

                <label htmlFor="colaborador">Colaborador</label>
                <input type="text" id="colaborador" />

                <label htmlFor="etiqueta">Etiqueta</label>
                <input type="text" id="etiqueta" />

                <label htmlFor="data-inicio">De:</label>
                <input type="date" id="data-inicio" />

                <label htmlFor="data-final">Até:</label>
                <input type="date" id="data-final" />

                <Button className="opcoes-botao">
                    Filtrar
                </Button>
                
            </div>
            <div className="a-c-listagem">

            </div>
        </section>
    )
}

export default AnotacoesCartao;