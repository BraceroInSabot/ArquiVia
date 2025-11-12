import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/Register';
import PanelPage from './pages/PanelPage';
import ProtectedRoute from './utils/protected_route';
import EnterprisePage from './pages/EnterprisePage';
import CreateEnterprisePage from './pages/CreateEnterprisePage';
import EditEnterprisePage from './pages/EditEnterprisePage';
import SectorPage from './pages/SectorPage';
import CreateSectorPage from './pages/CreateSectorPage';
import ViewSectorPage from './pages/ViewSectorPage';
import EditSectorPage from './pages/EditSectorPage';
import DocumentPage from './pages/DocumentPage';
import EditDocumentPage from './pages/EditDocumentPage';
import RequestResetPassword from './pages/RequestResetPassword';

function ArquiVia() {
  return (
    <div>
      <Routes>
        {/* Tratamento de rotas públicas. Todos usuários podem acessar. */}
        <Route path="/" element={<IndexPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/solicitar-redefinicao-senha" element={<RequestResetPassword />} />

        {/* Tratamento de rotas privadas. Somente usuários logados podem fazer o acesso. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/painel" element={<PanelPage />} />
          <Route path="/empresas" element={<EnterprisePage />} />
          <Route path="/criar-empresa" element={<CreateEnterprisePage />} />
          <Route path="/empresas/editar/:id" element={<EditEnterprisePage />} />
          <Route path="/setores" element={<SectorPage />} />
          <Route path="/setor/criar" element={<CreateSectorPage />} />
          <Route path="/setor/:id" element={<ViewSectorPage />} />
          <Route path='/setor/editar/:id' element={<EditSectorPage />} />
          <Route path='/documentos' element={<DocumentPage />} />
          <Route path='/documento/editar/:id' element={<EditDocumentPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default ArquiVia;