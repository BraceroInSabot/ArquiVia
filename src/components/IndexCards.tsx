import "../assets/css/IndexCards.css";
import orientacao from "../assets/img/icons/orientacao.png";
import naoRevisado from "../assets/img/icons/nao-revisado.png";

function IndexCards() {
  return (
    <div className="cards-container">
        <div className="cartao" id="card-1">
            <div className="cartao-header">
                <h2>Como fazer a primeira Transmissão</h2>
                <img src={orientacao} alt="Orientação" />
            </div>

            <div className="cartao-body">
                <p>Lorem Ipsum is simply dummy text of the printing and  typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of  type and scrambled it to make a type specimen book. It has survived not  only five centuries, but also the leap into electronic typesetting,  remaining essentially unchanged.</p>
            </div>

            <div className="cartao-footer">
                <div className="anotacao-revisao-status">
                    <img src={naoRevisado} alt="Status da Revisao" />
                </div>

                <div className="meta-info">
                    <div className="urgencia">
                        <span>FT</span>
                    </div>

                    <div className="data-alteracao">
                        <span>25 de fev. 2025</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="cartao" id="card-2">
            <h2>Titulo</h2>

        </div>

        <div className="cartao" id="card-3">
            <h2>Titulo</h2>

        </div>
    </div>
  );
}

export default IndexCards;