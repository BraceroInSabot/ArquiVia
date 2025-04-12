import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { AppSidebar } from '../components/NavBar/NavBar'

function LayoutWithSidebar() {
  return (
    <SidebarProvider>
        <div className="relative flex ">
            <AppSidebar />
            <SidebarTrigger className="z-50 sticky top-4 left-4 text-white" />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    </SidebarProvider>
  )
}

export default LayoutWithSidebar;