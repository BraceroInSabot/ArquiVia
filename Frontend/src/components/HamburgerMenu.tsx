import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/HamburgerMenu.css';
import { useAuth } from '../contexts/AuthContext';
// 1. Importe o useLocation
import { useNavigate, useLocation } from 'react-router-dom'; 
import Menu from './Menu';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // 2. Pegue o objeto location atual
    const location = useLocation(); 
    
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const goToProfile = () => {
        navigate('/perfil');
    };

    // 3. NOVO: Fecha o menu automaticamente quando a rota mudar
    useEffect(() => {
        setIsOpen(false);
    }, [location]); // O array de dependência [location] garante que isso rode a cada navegação

    // Fecha o menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <nav className="navbar bg-body-tertiary fixed-top shadow-sm" style={{ padding: '0.5rem 1rem' }}>
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    
                    <button 
                        className="btn border-0 p-0" 
                        type="button" 
                        onClick={toggleMenu}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" style={{ width: '1.5em', height: '1.5em' }}></span>
                    </button>

                    <div 
                        className="d-flex align-items-center gap-2 user-select-none" 
                        onClick={goToProfile} 
                        style={{ cursor: 'pointer' }}
                        title="Ir para o Perfil"
                    >
                        {user ? (
                            <>
                                <span className="d-none d-sm-block fw-semibold text-secondary">
                                    {user.data.name}
                                </span>
                                {user.data.image ? (
                                    <img 
                                        src={user.data.image} 
                                        alt="Avatar" 
                                        className="rounded-circle border"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div 
                                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                                    >
                                        {user.data.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </>
                        ) : (
                            <span>Entrar</span>
                        )}
                    </div>
                </div>
            </nav>

            <div 
                className={`offcanvas offcanvas-start ${isOpen ? 'show' : ''}`} 
                tabIndex={-1} 
                id="offcanvasNavbar" 
                ref={menuRef}
                style={{ visibility: isOpen ? 'visible' : 'hidden' }}
            >
                <div className="offcanvas-header">
                    <a href="/painel" className='text-decoration-none color-blue'><h5 className="offcanvas-title" id="offcanvasNavbarLabel">ArquiVia</h5></a>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={toggleMenu} 
                        aria-label="Close"
                    ></button>
                </div>
                
                <div className="offcanvas-body">
                    <Menu />
                </div>
            </div>

            {isOpen && (
                <div 
                    className="modal-backdrop fade show" 
                    style={{ zIndex: 1040 }}
                    onClick={toggleMenu}
                ></div>
            )}
        </>
    );
};

export default HamburgerMenu;