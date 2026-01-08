import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/Authentication/LoginPage';
import RegisterPage from './pages/Authentication/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './utils/protected_route';
import EnterprisePage from './pages/Enterprise/EnterprisePage';
import CreateEnterprisePage from './pages/Enterprise/CreateEnterprisePage';
import EditEnterprisePage from './pages/Enterprise/EditEnterprisePage';
import SectorPage from './pages/Sector/SectorPage';
import CreateSectorPage from './pages/Sector/CreateSectorPage';
import ViewSectorPage from './pages/Sector/ViewSectorPage';
import EditSectorPage from './pages/Sector/EditSectorPage';
import DocumentPage from './pages/Document/DocumentPage';
import EditDocumentPage from './pages/Document/EditDocumentPage';
import RequestResetPassword from './pages/Authentication/RequestResetPasswordPage';
import ResetPassword from './pages/Authentication/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './components/menu/MenuLayout';
import CompleteProfilePage from './pages/Authentication/CompleteProfilePage';
import PlanConsole from './pages/Payment/PlanConsole';


function ArquiVia() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/solicitar-redefinicao-senha" element={<RequestResetPassword />} />
        <Route path="/redefinir-senha/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/painel" element={<DashboardPage />} />
            <Route path="/empresas" element={<EnterprisePage />} />
            <Route path="/criar-empresa" element={<CreateEnterprisePage />} />
            <Route path="/empresas/editar/:id" element={<EditEnterprisePage />} />
            <Route path="/setores" element={<SectorPage />} />
            <Route path="/setor/criar" element={<CreateSectorPage />} />
            <Route path="/setor/:id" element={<ViewSectorPage />} />
            <Route path='/setor/editar/:id' element={<EditSectorPage />} />
            <Route path='/perfil' element={<ProfilePage />} />
            <Route path='/documentos' element={<DocumentPage />} />
            <Route path='/gerenciador-planos' element={<PlanConsole/>}/>
          </Route>
            <Route path='/completar-perfil' element={<CompleteProfilePage/>}/> 
            <Route path='/documento/editar/:id' element={<EditDocumentPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default ArquiVia;