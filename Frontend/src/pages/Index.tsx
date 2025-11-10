import { useNavigate } from 'react-router-dom';
import heroImage from '../utils/fotos/img-index.png';

const styles = `

  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero-image-placeholder {
    width: 100%;
    max-width: 500px; /* Mantém o tamanho máximo */
    height: auto; /* Ajusta a altura automaticamente */
  }

  :root {
    --primary-color: #007bff;
    --secondary-color: #0056b3;
    --text-color: #333;
    --bg-color: #f8f9fa;
    --white: #ffffff;
  }

  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    /* CORRIGIDO: A sintaxe 'var(#EEEEEE)' estava incorreta. 
       Voltando para --text-color para não quebrar o resto da página. */
    color: var(--text-color);
  }

  .landing-container {
    max-width: 1920px;
    margin: 0 auto;
    overflow-x: hidden;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 0;
  }

  .logo {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--primary-color);
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  .nav-links a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    text-decoration: none;
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: var(--white);
  }

  .btn-secondary {
    background-color: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
  }
  
  .btn-outline-light {
    background-color: transparent;
    border: 1px solid var(--white);
    color: var(--white);
  }
  
  .btn-light {
    background-color: var(--white);
    color: var(--primary-color);
  }


  /* Hero Section */
  .hero {
    display: flex;
    align-items: center;
    padding: 4rem 0;
    gap: 2rem;
  }

  .hero-text {
    flex: 1;
  }

  .hero-text h1 {
    font-size: 2.8rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  .hero-text p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .hero-buttons {
    display: flex;
    gap: 1rem;
  }

  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero-image-placeholder {
    width: 100%;
    max-width: 500px;
    height: 350px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-style: italic;
  }

  /* About Section */
  .about {
    display: flex;
    gap: 2rem;
    padding: 4rem 0;
    background-color: var(--bg-color);
  }

  .about-left, .about-right {
    flex: 1;
  }

  .about-left h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .about-features {
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .about-right-box {
    background-color: var(--primary-color);
    color: var(--white);
    padding: 2rem;
    border-radius: 8px;
  }

  .about-right-box ol {
    padding-left: 1.2rem;
  }
  
  .about-right-box li {
    margin-bottom: 0.8rem;
    font-size: 1.05rem;
  }

  /* Plans Section */
  .plans {
    padding: 4rem 0;
    text-align: center;
  }
  
  .plans h2 {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }

  .plans-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  .plan-card {
    flex: 1;
    max-width: 350px;
    padding: 2rem;
    border-radius: 8px;
    color: var(--white);
    text-align: left;
  }

  .plan-card.basic { background-color: #0056b3; }
  .plan-card.pro { background-color: var(--primary-color); }
  .plan-card.empress { background-color: #003a75; }

  .plan-card h3 {
    font-size: 1.5rem;
    border-bottom: 2px solid var(--white);
    padding-bottom: 0.5rem;
  }

  .plan-card .price {
    font-size: 2.2rem;
    font-weight: bold;
    margin: 1.5rem 0;
  }

  /* Differentiators Section */
  .differentiators {
    padding: 4rem 0;
    background-color: var(--bg-color);
  }
  
  .differentiators-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .diff-left, .diff-right {
    flex: 1;
  }

  .diff-left h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .diff-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .diff-item {
    flex-basis: calc(50% - 0.5rem);
    background-color: var(--primary-color);
    color: var(--white);
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .cta-box {
    background-color: #003a75;
    color: var(--white);
    padding: 2.5rem;
    border-radius: 8px;
  }
  
  .cta-box h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .cta-buttons {
    display: flex;
    gap: 1rem;
  }

  .footer {
    padding: 2.5rem 0;
    color: #000000ff; /* Texto claro */
    display: flex; /* CORRIGIDO: 'center' é inválido */
    justify-content: center; /* Centraliza o conteúdo horizontalmente */
    align-items: center;
    font-size: 0.9rem;
    /* border-top removido */
  }
  
  .footer-links {
    display: flex;
    flex-wrap: wrap; /* Permite quebrar linha em telas pequenas */
    justify-content: center; /* Centraliza os links */
    gap: 2rem; /* Aumentei o espaçamento */
  }

  /* NOVA REGRA para os links do footer */
  .footer-links a {
    text-decoration: none; /* Remove sublinhado */
    color: #000000ff; /* Cor clara para os links */
    transition: color 0.3s ease;
  }
  
  .footer-links a:hover {
    color: var(--primary-color); /* Efeito hover */
  }

  /* Responsive Design */

  /* Regra para esconder a imagem em telas menores que 1000px */
  @media (max-width: 999px) {
    .hero-image {
      display: none;
    }
    .about-right {
      display: none;
    }
  }

  @media (max-width: 992px) {
    .hero, .about, .differentiators-container {
      flex-direction: column;
    }
    
    .hero-text {
      text-align: center;
    }
    
    .hero-buttons {
      justify-content: center;
    }
    
    .plans-container {
      flex-direction: column;
      align-items: center;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .nav-links {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .diff-item {
      flex-basis: 100%;
    }
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div className="landing-container">
        {/* Header */}
        <header className="header container">
          <div className="logo">ArquiVia</div>
          <nav className="nav-links">
            <a href="#sobre">Sobre</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
          </nav>
          <button className="btn btn-primary" onClick={() => navigate('/entrar')}>
            Entrar
          </button>
        </header>

        <main>
          {/* Hero Section */}
          <section className="hero container">
            <div className="hero-text">
              <h1>ArquiVia: gestão e recuperação inteligente de documentos corporativos</h1>
              <p>Organize, classifique e reorganize documentos com segurança e agilidade.</p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/registrar')}>
                  Testar gratuitamente
                </button>
                <button className="btn btn-secondary">Conhecer os planos</button>
              </div>
            </div>
            <div className="hero-image">
              <img
                src={heroImage}
                alt="Ilustração ArquiVia - Gestão de documentos"
                className="hero-image-placeholder" // Reutilizamos a classe para manter o tamanho
              />
            </div>
          </section>

          {/* About Section */}
          <section id="sobre" className="about">
            <div className="container" style={{ display: 'flex', gap: '2rem' }}>
              <div className="about-left">
                <h2>Sobre a ArquiVia</h2>
                <p>Com o aumento das informações, redundância e desinformação, é essencial ter uma solução eficaz para organizar e acessar documentos em empresas</p>
                <div className="about-features">
                  <span>✔ Segurança</span>
                  <span>✔ Organização</span>
                  <span>✔ Eficiência</span>
                </div>
              </div>
              <div className="about-right">
                <div className="about-right-box">
                  <ol>
                    <li>Criação de Empresas e setores</li>
                    <li>Cadastro e classificação de documentos</li>
                    <li>Controle de Versões e auditoria</li>
                    <li>Permissões e gerenciamento de equipes</li>
                    <li>Recuperação rápida por busca inteligente</li>
                    <li>Backup e redundância de dados</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Plans Section */}
          <section id="planos" className="plans container">
            <h2>Planos</h2>
            <div className="plans-container">
              <div className="plan-card basic">
                <h3>Básico</h3>
                <div className="price">R$ 99/mes</div>
                <button className="btn btn-light">Assinar</button>
              </div>
              <div className="plan-card pro">
                <h3>Pro</h3>
                <div className="price">R$ 249/mes</div>
                <button className="btn btn-light">Assinar</button>
              </div>
              <div className="plan-card empress">
                <h3>Empress</h3>
                <div className="price">R$ 1099/mes</div>
                <button className="btn btn-light">Assinar</button>
              </div>
            </div>
          </section>

          {/* Differentiators / CTA */}
          <section id="funcionalidades" className="differentiators">
            <div className="differentiators-container container">
              <div className="diff-left">
                <h2>Diferenciais nossos</h2>
                <div className="diff-grid">
                  <div className="diff-item">Segurança e Transparência</div>
                  <div className="diff-item">Acessibilidade</div>
                  <div className="diff-item">Rapidez</div>
                  <div className="diff-item">Funcionalidades</div>
                  <div className="diff-item">Resoluções</div>
                </div>
              </div>
              <div className="diff-right">
                <div className="cta-box">
                  <h3>Sua empresa mais organizada, segura e eficiente com a ArquiVia</h3>
                  <div className="cta-buttons">
                    <button className="btn btn-light" onClick={() => navigate('/registrar')}>
                      Criar conta Grátis
                    </button>
                    <button className="btn btn-outline-light">Falar com Vendas</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="footer"> {/* Removido .container para o fundo preto ir de ponta a ponta */}
          <div className="footer-links container"> {/* Adicionado .container aqui para alinhar o conteúdo */}
            <a href="#">Termos</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">FAQ</a>
            <a href="#">📞 17996326500</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;