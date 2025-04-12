import {
    Home,
    FileText,
    NotebookPen,
    User,
    Building2,
    LogOut
  } from "lucide-react"
  

import {
  Sidebar,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"

import { logout } from "../../api/apiHandler"
import { useNavigate } from "react-router"
import { Button } from "../ui/button"

  const items = [
    {
      title: "Início",
      url: "/",
      icon: Home, // ícone clássico de dashboard
    },
    {
      title: "Anotação",
      url: "/anotacoes",
      icon: NotebookPen, // representa bem escrita ou registro
    },
    {
      title: "Documentação",
      url: "#",
      icon: FileText, // ideal para documentos e textos
    },
    {
      title: "Perfil",
      url: "/perfil",
      icon: User, // padrão para usuário
    },
    {
      title: "Setor",
      url: "/setor",
      icon: Building2, // representa departamentos ou setores
    },
  ]

export function AppSidebar() {
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    }
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem key="Sair">
            <SidebarMenuButton asChild>
            <Button onClick={handleLogout}>
                <LogOut />
                <span>Sair</span>
            </Button>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}
