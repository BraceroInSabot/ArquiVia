import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/imgs/img-index.png';
import { useAuth } from '../contexts/AuthContext';
import '../assets/css/Index.css';

const IndexPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado para controlar o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const goToIndexPage = () => navigate('/painel');
  const goToLoginPage = () => navigate('/entrar');
  const goToRegisterPage = () => navigate('/registrar');

  return (
    <>
      {/* NAVBAR FIXA */}
      <nav className="navbar-fixed">
        <div className="container navbar-content">
          
          {/* 1. Logo */}
          <div className="logo">ArquiVia</div>

          {/* 2. Links Desktop (Somem no Mobile via CSS) */}
          <div className="nav-links-desktop">
            <a href="#sobre">Sobre</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
          </div>

          {/* 3. Botões Desktop (Somem no Mobile via CSS) */}
          <div className="nav-buttons-desktop">
            {user ? (
              <button onClick={goToIndexPage} className='btn btn-primary'>Acessar Painel</button>
            ) : (
              <>
                <button onClick={goToLoginPage} className='btn btn-outline-primary'>Entrar</button>
                <button onClick={goToRegisterPage} className='btn btn-primary'>Registrar</button>
              </>
            )}
          </div>

          {/* 4. Botão Hambúrguer (Aparece só no Mobile via CSS) */}
          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? '✕' : '☰'} {/* Troca ícone se aberto/fechado */}
          </button>
        </div>

        {/* 5. Menu Mobile (Renderizado condicionalmente) */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#sobre" onClick={toggleMobileMenu}>Sobre</a>
            <a href="#funcionalidades" onClick={toggleMobileMenu}>Funcionalidades</a>
            <a href="#planos" onClick={toggleMobileMenu}>Planos</a>
            <a href="#depoimentos" onClick={toggleMobileMenu}>Depoimentos</a>
            
            <div className="mobile-menu-buttons">
              {user ? (
                <button onClick={goToIndexPage} className='btn btn-primary'>Acessar Painel</button>
              ) : (
                <>
                  <button onClick={goToLoginPage} className='btn btn-outline-primary'>Entrar</button>
                  <button onClick={goToRegisterPage} className='btn btn-primary'>Registrar</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* CONTEÚDO DA PÁGINA */}
      <div className="landing-container">
        <main>
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
                alt="Ilustração ArquiVia"
                className="hero-image-placeholder"
              />
            </div>
          </section>

          <section id="sobre" className="about">
            <div className="container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '60px' }}>
              <div className="about-left">
                <h2>Sobre a ArquiVia</h2>
                <p>Com o aumento das informações, redundância e desinformação, é essencial ter uma solução eficaz.</p>
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

          <section id="planos" className="plans container" style={{ paddingTop: '60px' }}>
            <h2>Planos</h2>
            <div className="plans-container">
              <div className="plan-card basic">
                <h3>Básico</h3>
                <div className="price">R$ 99/mês</div>
                <button className="btn btn-light">Assinar</button>
              </div>
              <div className="plan-card pro">
                <h3>Pro</h3>
                <div className="price">R$ 249/mês</div>
                <button className="btn btn-light">Assinar</button>
              </div>
              <div className="plan-card empress">
                <h3>Empress</h3>
                <div className="price">R$ 1099/mês</div>
                <button className="btn btn-light">Assinar</button>
              </div>
            </div>
          </section>

          <section id="funcionalidades" className="differentiators" style={{ paddingTop: '60px' }}>
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
                  <h3>Sua empresa mais organizada com a ArquiVia</h3>
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

        <footer className="footer">
          <div className="footer-links container">
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

export default IndexPage;