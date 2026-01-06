import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/imgs/img-index2.png';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, CheckCircle, Shield, Zap, Search, Users, ArrowRight, FileText, Activity, ShieldCheck, MousePointer2 } from 'lucide-react';
//@ts-ignore
import Prism from "prismjs";
import Arquivia from '../assets/imgs/arquivia.png';

const IndexPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const goToIndexPage = () => navigate('/painel');
  const goToLoginPage = () => navigate('/entrar');
  const goToRegisterPage = () => navigate('/registrar');

  return (
    <div className="min-h-screen bg-base-100 text-neutral font-sans selection:bg-primary selection:text-white">
      
      <div className="navbar fixed top-0 z-50 bg-base-100/80 backdrop-blur-md shadow-sm h-20 px-4 md:px-10 border-b border-base-200 transition-all duration-300">
        <div className="navbar-start">
          <a className="btn btn-ghost normal-case text-2xl font-bold text-primary hover:bg-transparent p-0 tracking-tight">
            <img src={Arquivia} alt="ArquiVia Logo" className="h-10 w-auto" />
          </a>
        </div>

        <div className="navbar-end hidden lg:flex gap-3">
          {user ? (
            <button onClick={goToIndexPage} className="btn btn-primary text-white rounded-full px-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Acessar Painel
            </button>
          ) : (
            <>
              <button onClick={goToLoginPage} className="btn btn-ghost font-semibold text-gray-600 hover:text-primary">
                Entrar
              </button>
              <button onClick={goToRegisterPage} className="btn btn-primary text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                Começar Grátis
              </button>
            </>
          )}
        </div>

        <div className="navbar-end lg:hidden">
          <button className="btn btn-square btn-ghost text-secondary" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-base-100 z-40 p-6 flex flex-col gap-6 animate-fade-in-down">
          <nav className="flex flex-col gap-4 text-center">
            <a href="#recursos" className="text-xl font-medium text-secondary py-3 border-b border-base-200" onClick={toggleMobileMenu}>Recursos</a>
            <a href="#seguranca" className="text-xl font-medium text-secondary py-3 border-b border-base-200" onClick={toggleMobileMenu}>Segurança</a>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            {user ? (
               <button onClick={goToIndexPage} className="btn btn-primary text-white w-full btn-lg">Acessar Painel</button>
            ) : (
              <>
                <button onClick={goToLoginPage} className="btn btn-outline w-full">Entrar</button>
                <button onClick={goToRegisterPage} className="btn btn-primary text-white w-full shadow-lg">Criar Conta Grátis</button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="pt-20">
        
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-base-100 to-base-200/50 overflow-hidden">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-center lg:text-left space-y-6 animate-in slide-in-from-bottom-5 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Versão Beta Gratuita
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary leading-tight tracking-tight">
                Chega de perder <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">documentos.</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Centralize, organize e encontre qualquer arquivo da sua empresa em segundos. Colaboração em tempo real com segurança de nível bancário.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button 
                  className="btn btn-primary text-white btn-lg rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform" 
                  onClick={goToRegisterPage}
                >
                  Começar Agora <ArrowRight size={20} />
                </button>
                <button className="btn btn-ghost btn-lg rounded-full hover:bg-base-200">
                  Ver demonstração
                </button>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1"><CheckCircle size={16} className="text-success"/> Sem burocracia</span>
                <span className="flex items-center gap-1"><CheckCircle size={16} className="text-success"/> Cancelamento grátis</span>
              </div>
            </div>

            <div className="relative lg:h-auto flex justify-center items-center animate-in fade-in zoom-in duration-1000 delay-200">
               <div className="relative w-full max-w-[550px]">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30"></div>
                 <img
                  src={heroImage}
                  alt="Dashboard ArquiVia"
                  className="relative rounded-2xl shadow-2xl border border-base-100 bg-base-100 w-full object-cover transform rotate-1 hover:rotate-0 transition-transform duration-500"
                />
                
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-base-100 flex items-center gap-3 animate-bounce delay-700">
                  <div className="bg-success/10 p-2 rounded-lg text-success"><CheckCircle size={24}/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                    <p className="font-bold text-secondary">Documento Aprovado</p>
                  </div>
                </div>
               </div>
            </div>

          </div>
        </section>

        <section id="recursos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Tudo o que sua equipe precisa</h2>
              <p className="text-gray-500 text-lg">Substitua pastas bagunçadas e drives desorganizados por uma plataforma inteligente e centralizada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group p-8 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Busca Inteligente</h3>
                <p className="text-gray-600 leading-relaxed">
                  Encontre documentos pelo conteúdo, tags, autor ou data. Nossa indexação recupera arquivos em milissegundos.
                </p>
              </div>

              <div className="group p-8 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Permissões Granulares</h3>
                <p className="text-gray-600 leading-relaxed">
                  Defina exatamente quem pode ver, editar ou excluir documentos. Controle total por setores e cargos.
                </p>
              </div>

              <div className="group p-8 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Colaboração Real</h3>
                <p className="text-gray-600 leading-relaxed">
                  Edite documentos em tempo real com sua equipe. Comentários, sugestões e histórico de versões automático.
                </p>
              </div>

               <div className="group p-8 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">OCR Automático</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transformamos imagens e PDFs digitalizados em texto pesquisável automaticamente.
                </p>
              </div>

               <div className="group p-8 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Gestão de Times</h3>
                <p className="text-gray-600 leading-relaxed">
                  Organize sua empresa em setores hierárquicos. O fluxo de documentos segue a estrutura do seu negócio.
                </p>
              </div>

               <div className="group p-8 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg flex flex-col justify-center items-center text-center transform hover:scale-[1.02] transition-transform cursor-pointer" onClick={goToRegisterPage}>
                <h3 className="text-2xl font-bold mb-2">Comece agora</h3>
                <p className="text-white/80 mb-6">Crie sua conta gratuita e explore.</p>
                <div className="bg-white text-secondary w-12 h-12 rounded-full flex items-center justify-center">
                  <ArrowRight size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pilares" className="py-20 bg-base-200">
           <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                
                <div className="flex flex-col items-center p-6 rounded-2xl bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                     <Activity size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Disponibilidade</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Sistemas resilientes que garantem acesso contínuo aos seus arquivos essenciais, quando e onde precisar.
                  </p>
                </div>

                <div className="flex flex-col items-center p-6 rounded-2xl bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                     <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Integridade</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Garantia absoluta de que seus documentos permanecem inalterados, autênticos e auditáveis.
                  </p>
                </div>

                <div className="flex flex-col items-center p-6 rounded-2xl bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                   <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                     <MousePointer2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Usabilidade</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Interface intuitiva focada na experiência do usuário, reduzindo drasticamente a curva de aprendizado.
                  </p>
                </div>

              </div>
           </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-neutral rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]" />

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
                Pronto para organizar sua empresa?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                Junte-se a empresas que reduziram o caos e aumentaram a produtividade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button 
                  className="btn btn-primary text-white btn-lg rounded-full px-10 border-none shadow-lg hover:bg-primary-focus"
                  onClick={goToRegisterPage}
                >
                  Criar conta gratuita
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-base-100 border-t border-base-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-neutral">ArquiVia</span>
            <p className="text-sm text-gray-500 mt-2">Tecnologia para inteligência corporativa.</p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-gray-600">
            <a className="hover:text-primary transition-colors cursor-pointer">Termos de Uso</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Privacidade</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Ajuda</a>
          </div>

          <div className="text-sm text-gray-400">
            © 2025 ArquiVia Ltda.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;