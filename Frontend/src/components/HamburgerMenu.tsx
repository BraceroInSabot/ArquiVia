import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, User } from 'lucide-react'; // Ícones

import { useAuth } from '../contexts/AuthContext';
import MenuContent from './Menu'; // Renomeei para evitar confusão com o ícone Menu

// Não precisamos mais do CSS externo se usarmos Tailwind corretamente
// import '../assets/css/HamburgerMenu.css'; 

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const goToProfile = () => navigate('/perfil');

    // Fecha o menu automaticamente quando a rota mudar
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Fecha o menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            {/* --- NAVBAR FIXA (DaisyUI) --- */}
            <div className="navbar fixed top-0 z-50 bg-base-100 shadow-sm h-16 px-4 border-b border-base-200">
                
                {/* Lado Esquerdo: Botão Menu */}
                <div className="navbar-start w-auto">
                    <button 
                        className="btn btn-ghost btn-circle text-secondary" 
                        onClick={toggleMenu}
                        aria-label="Abrir menu"
                    >
                        <MenuIcon size={24} />
                    </button>
                </div>

                {/* Centro: Logo (Opcional, mas bom para mobile) */}
                <div className="navbar-center">
                     {/* Você pode descomentar isso se quiser a logo aqui */}
                     {/* <span className="text-xl font-bold text-primary">ArquiVia</span> */}
                </div>

                {/* Lado Direito: Perfil */}
                <div className="navbar-end flex-1 justify-end">
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors" 
                        onClick={goToProfile}
                        title="Ir para o Perfil"
                    >
                        {user ? (
                            <>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-secondary leading-none">{user.data.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Ver Perfil</p>
                                </div>
                                
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-10 h-10 ring ring-primary ring-offset-base-100 ring-offset-2">
                                        {user.data.image ? (
                                            <img src={user.data.image} alt={user.data.name} />
                                        ) : (
                                            <span className="text-lg font-semibold">
                                                {user.data.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button className="btn btn-sm btn-outline btn-primary">
                                Entrar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- BACKDROP (Fundo Escuro) --- */}
            {/* Aparece suavemente quando isOpen é true */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* --- DRAWER (Menu Lateral) --- */}
            <div 
                ref={menuRef}
                className={`fixed top-0 left-0 h-full w-80 bg-base-100 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-200 bg-base-100">
                    <span 
                        onClick={() => { navigate('/painel'); setIsOpen(false); }}
                        className="text-2xl font-bold text-primary cursor-pointer"
                    >
                        ArquiVia
                    </span>
                    <button 
                        className="btn btn-sm btn-ghost btn-circle" 
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Drawer Body (O conteúdo do seu Menu.tsx) */}
                <div className="flex-1 overflow-y-auto">
                    <MenuContent />
                </div>
            </div>
        </>
    );
};

export default HamburgerMenu;