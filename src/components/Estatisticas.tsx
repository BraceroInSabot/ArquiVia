import "../assets/css/Estatisticas.css";
import up from "../assets/img/etc/up.png";
import GraficoBarra from "./Graficos/Barra";
import GraficoPizza from "./Graficos/Pizza";

function Estatisticas() {
  return (
    <section>
      <div className="estatisticas">
          <div className="DocEstatisticas">
            <h3 className="eTitulo">Documentações Compartilhadas</h3>
            <h2 className="eIndicativo">75%</h2>
            <div className="ePorcentagemContainer">
              <img src={up} alt="" />
              <p className="ePorcentagem">5%</p>
            </div>
          </div>
          <div className="DocEstatisticas">
            <h3 className="eTitulo">Documentações Compartilhadas</h3>
            <h2 className="eIndicativo">75%</h2>
            <div className="ePorcentagemContainer">
              <img src={up} alt="" />
              <p className="ePorcentagem">5%</p>
            </div>
          </div>

          <div className="DocEstatisticas">
            <h3 className="eTitulo">Documentações Compartilhadas</h3>
            <h2 className="eIndicativo">75%</h2>
            <div className="ePorcentagemContainer">
              <img src={up} alt="" />
              <p className="ePorcentagem">5%</p>
            </div>
          </div>
      </div>

      <div className="graficos">
          <div className="graficoBarra">
            <GraficoBarra />
          </div>

          <div className="graficoBarra">
            <GraficoBarra />
          </div>

          <div className="graficoPizzaContainer">
            <div className="graficoPìzza">
              <GraficoPizza />
            </div>
            <div className="graficoPìzza">
              <GraficoPizza />
            </div>
          </div>
      </div>
    </section>
  );
}

export default Estatisticas;