import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Index from './src/routes/Index.tsx'
import Login from './src/routes/Login.tsx'
import Perfil from './src/routes/Perfil.tsx'
import EsqueciSenha from './src/routes/EsqueciSenha.tsx'
import Setor from './src/routes/Setor.tsx'
import Anotacoes from './src/routes/Anotacoes.tsx'
import ResetPassword from './src/routes/RedefinirSenha.tsx'

import { ThemeProvider } from './src/components/theme/theme-provider.tsx'
import './src/index.css'

import { Toaster } from "./src/components/ui/sonner.tsx"
import LayoutWithSidebar from './src/tsx/LayoutWithSidebar.tsx'
import LayoutNoSidebar from './src/tsx/LayoutNoSidebar.tsx'

// import ModeToggle from './src/components/DarkMode/dkMode.tsx'

const router = createBrowserRouter([
  {
    element: <LayoutWithSidebar />,
    children: [
      { path: '/', element: <Index /> },
      { path: 'perfil', element: <Perfil /> },
      { path: 'setor', element: <Setor /> },
      { path: 'anotacoes', element: <Anotacoes /> },
    ]
  },
  {
    element: <LayoutNoSidebar />,
    children: [
      { path: 'redefinir-senha/:token', element: <ResetPassword /> },
      { path: 'login', element: <Login /> },
      { path: 'esqueci-minha-senha', element: <EsqueciSenha /> },
    ]
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <div className='pl-5 pr-5'>
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </ThemeProvider>
  </StrictMode>
)
