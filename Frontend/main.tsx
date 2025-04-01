import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Index from './src/routes/Index.tsx'
import Login from './src/routes/Login.tsx'
import Registrar from './src/routes/Registrar.tsx'
import Perfil from './src/routes/Perfil.tsx'
import EsqueciSenha from './src/routes/EsqueciSenha.tsx'
import Setor from './src/routes/Setor.tsx'
import Anotacoes from './src/routes/Anotacoes.tsx'
import ResetPassword from './src/routes/RedefinirSenha.tsx'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Index />,
    },
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'registrar',
      element: <Registrar />,
    },
    {
      path: 'esqueci-minha-senha',
      element: <EsqueciSenha />,
    },
    {
      path: 'perfil',
      element: <Perfil />
    },
    {
      path: 'setor',
      element: <Setor />
    },
    {
      path: 'anotacoes',
      element: <Anotacoes />
    },
    {
      path: 'refinir-senha/:token',
      element: <ResetPassword />
    }
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
