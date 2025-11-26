import { useNavigate, useLocation } from "react-router-dom";
import { Building2, Layers, FileText, User } from 'lucide-react'; // Ícones
import LogoutButton from "../button/LogoutButton";

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Usado para saber qual item está ativo

    // Helper para verificar se o link está ativo
    const isActive = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

    const navItems = [
        { label: 'Empresas', path: '/empresas', icon: <Building2 size={20} /> },
        { label: 'Setores', path: '/setores', icon: <Layers size={20} /> },
        { label: 'Documentos', path: '/documentos', icon: <FileText size={20} /> },
        { label: 'Meu Perfil', path: '/perfil', icon: <User size={20} /> },
    ];
    
    return (
        <div className="flex flex-col h-full bg-base-100 text-base-content">
            
            {/* Título opcional ou espaçamento */}
            <div className="px-6 pt-4 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Navegação Principal
                </span>
            </div>

            {/* Lista do Menu DaisyUI */}
            <ul className="menu menu-md w-full flex-1 gap-2 px-4">
                {navItems.map((item) => (
                    <li key={item.path}>
                        <a 
                            onClick={() => navigate(item.path)}
                            className={`${isActive(item.path)} flex items-center gap-3 py-3 font-medium hover:text-primary transition-colors`}
                        >
                            {item.icon}
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>

            {/* Rodapé com Logout */}
            <div className="p-4 border-t border-base-300 mt-auto">
                <div className="flex justify-center">
                   {/* Envolvemos o LogoutButton para garantir o layout */}
                   <div className="w-full">
                        <LogoutButton/>
                   </div>
                </div>
            </div>
        </div>
    )
}

export default Menu;