// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import EnterpriseIndexPage from './pages/EnterpriseIndexPage';

function ArquiVia() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/menu" element={<EnterpriseIndexPage />} />
      </Routes>
    </div>
  );
}

export default ArquiVia;