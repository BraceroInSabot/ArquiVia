import { Outlet } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import { Toaster } from 'react-hot-toast'; // 1. Importe o Toaster

const MainLayout = () => {
    return (
        <div className="main-layout">
            {/* 2. Adicione o componente <Toaster /> aqui */}
            {/* Ele vai renderizar todas as notificações no topo da tela */}
            <Toaster 
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#28a745', // Verde
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#dc3545', // Vermelho
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <HamburgerMenu />

            <main style={{ paddingTop: '70px', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;