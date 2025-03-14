import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Index from './src/routes/Index.tsx'
import Login from './src/routes/Login.tsx'
import Registrar from './src/routes/Registrar.tsx'
import EsqueciSenha from './src/routes/EsqueciSenha.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
