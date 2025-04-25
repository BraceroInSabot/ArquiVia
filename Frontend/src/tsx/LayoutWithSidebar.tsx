import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/NavBar/NavBar';

function LayoutWithSidebar() {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="relative">
          <AppSidebar />
          <SidebarTrigger className="absolute top-4 left-full ml-2 z-50 text-white bg-purple-500 hover:bg-purple-600 p-2 rounded-full shadow-lg transition-all duration-300" />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default LayoutWithSidebar;