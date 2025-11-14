import { Outlet } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <HamburgerMenu />

            <main style={{ paddingTop: '70px', minHeight: '100vh', backgroundColor: '#f4f4f9' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;