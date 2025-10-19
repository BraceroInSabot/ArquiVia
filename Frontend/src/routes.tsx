// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import PanelPage from './pages/PanelPage';
import ProtectedRoute from './utils/protected_route';
import EnterprisePage from './pages/EnterprisePage';
import CreateEnterprisePage from './pages/CreateEnterprisePage';

function ArquiVia() {
  return (
    <div>
      <Routes>
        {/* Tratamento de rotas públicas. Todos usuários podem acessar. */}
        <Route path="/" element={<IndexPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />

        {/* Tratamento de rotas privadas. Somente usuários logados podem fazer o acesso. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/painel" element={<PanelPage />} />
          <Route path="/empresas" element={<EnterprisePage />} />
          <Route path="/criar-empresa" element={<CreateEnterprisePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default ArquiVia;