import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/imgs/img-index2.png';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, CheckCircle, Shield, Zap, Layers, ArrowRight } from 'lucide-react';
//@ts-ignore
import Prism from "prismjs";

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
    <div className="min-h-screen bg-base-100 text-neutral font-sans">
      
      {/* --- NAVBAR (DaisyUI Navbar) --- */}
      <div className="navbar fixed top-0 z-50 bg-base-100/95 backdrop-blur shadow-sm h-20 px-4 md:px-10 border-b border-gray-200">
        <div className="navbar-start">
          {/* Logo */}
          <a className="btn btn-ghost normal-case text-2xl font-bold text-primary hover:bg-transparent p-0">
            ArquiVia
          </a>
        </div>

        {/* Menu Desktop (Centro) */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            <li><a href="#sobre" className="text-secondary font-medium hover:text-primary active:bg-transparent hover:bg-transparent">Sobre</a></li>
            <li><a href="#funcionalidades" className="text-secondary font-medium hover:text-primary active:bg-transparent hover:bg-transparent">Funcionalidades</a></li>
            <li><a href="#planos" className="text-secondary font-medium hover:text-primary active:bg-transparent hover:bg-transparent">Planos</a></li>
          </ul>
        </div>

        {/* Botões Desktop (Direita) */}
        <div className="navbar-end hidden lg:flex gap-3">
          {user ? (
            <button onClick={goToIndexPage} className="btn btn-primary text-white rounded-full px-6">
              Acessar Painel
            </button>
          ) : (
            <>
              <button onClick={goToLoginPage} className="btn btn-ghost text-secondary hover:text-primary">
                Entrar
              </button>
              <button onClick={goToRegisterPage} className="btn btn-primary text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                Registrar
              </button>
            </>
          )}
        </div>

        {/* Botão Mobile (Hambúrguer) */}
        <div className="navbar-end lg:hidden">
          <button className="btn btn-square btn-ghost text-secondary" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE (Gaveta) --- */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-0 w-full bg-base-100 shadow-lg z-40 border-t border-gray-100 p-4 flex flex-col gap-4 lg:hidden animate-fade-in-down">
          <a href="#sobre" className="text-lg font-medium text-secondary py-2 border-b border-gray-100" onClick={toggleMobileMenu}>Sobre</a>
          <a href="#funcionalidades" className="text-lg font-medium text-secondary py-2 border-b border-gray-100" onClick={toggleMobileMenu}>Funcionalidades</a>
          <a href="#planos" className="text-lg font-medium text-secondary py-2 border-b border-gray-100" onClick={toggleMobileMenu}>Planos</a>
          <div className="flex flex-col gap-3 mt-2">
            {user ? (
               <button onClick={goToIndexPage} className="btn btn-primary text-white w-full">Acessar Painel</button>
            ) : (
              <>
                <button onClick={goToLoginPage} className="btn btn-outline btn-primary w-full">Entrar</button>
                <button onClick={goToRegisterPage} className="btn btn-primary text-white w-full">Registrar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Compensação para a Navbar Fixa */}
      <div className="pt-20"></div>

      <main>
        {/* --- HERO SECTION --- */}
        <div className="hero min-h-[80vh] bg-base-100">
          <div className="hero-content flex-col lg:flex-row-reverse gap-10 px-4 max-w-7xl mx-auto">
            <div className="flex-1 flex justify-center">
               <img
                src={heroImage}
                alt="Gestão de documentos"
                className="max-w-full h-auto rounded-lg shadow-2xl border-4 border-white mask mask-squircle w-[500px]"
              />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary leading-tight">
                Gestão e recuperação <span className="text-primary">inteligente</span> de documentos.
              </h1>
              <p className="py-6 text-lg text-gray-600">
                Organize, classifique e reorganize documentos corporativos com segurança e agilidade. A solução definitiva para eliminar a papelada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn btn-primary text-white btn-lg rounded-full shadow-lg hover:-translate-y-1 transition-transform" onClick={() => navigate('/registrar')}>
                  Testar gratuitamente
                </button>
                <button className="btn btn-outline btn-secondary btn-lg rounded-full hover:bg-secondary hover:text-white">
                  Conhecer os planos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- ABOUT SECTION --- */}
        <section id="sobre" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-6 border-l-4 border-primary pl-4">
                  Sobre a ArquiVia
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Com o aumento das informações, redundância e desinformação, é essencial ter uma solução eficaz para organizar e acessar documentos em empresas. Nós trazemos clareza para o seu fluxo de trabalho.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Shield className="text-primary" size={24} /></div>
                    <span className="text-xl font-semibold text-secondary">Segurança Avançada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Layers className="text-primary" size={24} /></div>
                    <span className="text-xl font-semibold text-secondary">Organização Hierárquica</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full"><Zap className="text-primary" size={24} /></div>
                    <span className="text-xl font-semibold text-secondary">Eficiência Operacional</span>
                  </div>
                </div>
              </div>

              <div className="card bg-secondary text-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-2xl text-white mb-4">Funcionalidades Principais</h3>
                  <ul className="space-y-3">
                    {[
                      "Criação de Empresas e setores",
                      "Cadastro e classificação de documentos",
                      "Controle de Versões e auditoria",
                      "Permissões e gerenciamento de equipes",
                      "Recuperação rápida por busca inteligente",
                      "Backup e redundância de dados"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="text-success mt-1 shrink-0" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PLANS SECTION --- */}
        <section id="planos" className="py-20 bg-base-100">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-secondary mb-4">Nossos Planos</h2>
            <p className="text-gray-500 mb-12 max-w-2xl mx-auto">Escolha a melhor opção para o tamanho da sua organização.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Plano Básico */}
              <div className="card bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-2xl text-secondary">Básico</h3>
                  <div className="text-4xl font-bold text-primary my-4">R$ 99<span className="text-base font-normal text-gray-400">/mês</span></div>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6 w-full text-left pl-8">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Até 5 usuários</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> 10GB Armazenamento</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Suporte por e-mail</li>
                  </ul>
                  <div className="card-actions w-full">
                    <button className="btn btn-outline btn-primary w-full rounded-full">Assinar Básico</button>
                  </div>
                </div>
              </div>

              {/* Plano Pro (Destaque) */}
              <div className="card bg-white shadow-2xl border-t-8 border-primary scale-105 z-10">
                <div className="card-body items-center text-center">
                  <div className="badge badge-primary badge-outline mb-2">Mais Popular</div>
                  <h3 className="card-title text-3xl text-secondary font-bold">Pro</h3>
                  <div className="text-5xl font-bold text-primary my-4">R$ 249<span className="text-xl font-normal text-gray-400">/mês</span></div>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6 w-full text-left pl-8">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Até 20 usuários</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> 100GB Armazenamento</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Suporte Prioritário</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Auditoria Avançada</li>
                  </ul>
                  <div className="card-actions w-full">
                    <button className="btn btn-primary text-white w-full rounded-full">Assinar Pro</button>
                  </div>
                </div>
              </div>

              {/* Plano Empress */}
              <div className="card bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-2xl text-secondary">Enterprise</h3>
                  <div className="text-4xl font-bold text-primary my-4">R$ 1099<span className="text-base font-normal text-gray-400">/mês</span></div>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6 w-full text-left pl-8">
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Usuários Ilimitados</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> 1TB Armazenamento</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> Gerente de Conta</li>
                    <li className="flex gap-2"><CheckCircle size={16} className="text-primary"/> API Dedicada</li>
                  </ul>
                  <div className="card-actions w-full">
                    <button className="btn btn-outline btn-primary w-full rounded-full">Assinar Enterprise</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- DIFFERENTIALS / CTA --- */}
        <section id="funcionalidades" className="py-20 bg-secondary text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-white">Diferenciais que transformam</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Segurança e Transparência", "Acessibilidade", "Rapidez", "Funcionalidades Customizáveis", "Resoluções Ágeis", "Suporte 24/7"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <CheckCircle className="text-primary" size={20} />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-white text-neutral shadow-2xl">
                <div className="card-body">
                  <h3 className="card-title text-2xl text-secondary mb-4">
                    Sua empresa mais organizada, segura e eficiente com a ArquiVia.
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Junte-se a centenas de empresas que já modernizaram sua gestão de documentos.
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-ghost text-secondary hover:bg-base-200">Falar com Vendas</button>
                    <button className="btn btn-primary text-white px-8" onClick={() => navigate('/registrar')}>
                      Começar Agora <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
        <div className="grid grid-flow-col gap-4">
          <a className="link link-hover hover:text-primary">Termos</a>
          <a className="link link-hover hover:text-primary">Política de Privacidade</a>
          <a className="link link-hover hover:text-primary">FAQ</a>
          <a className="link link-hover hover:text-primary font-bold">📞 17 99555-5555</a>
        </div>
        <div>
          <p>Copyright © 2025 - Todos os direitos reservados por ArquiVia Ltda</p>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;