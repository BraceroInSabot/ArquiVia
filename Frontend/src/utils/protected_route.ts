import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';
import { Loader2 } from 'lucide-react';

import '../assets/css/Loading.css'; 

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return React.createElement(
      'div', 
      { className: "d-flex flex-column align-items-center justify-content-center vh-100 text-muted" },
      React.createElement(Loader2, { className: "animate-spin text-primary-custom", size: 48 }),
      React.createElement('p', { className: "mt-3 mb-0 fs-5" }, 'Verificando autenticação...')
    );
  }

  if (!user) {
    return React.createElement(Navigate, { to: '/entrar', replace: true });
  }

  return React.createElement(Outlet, null);
};

export default ProtectedRoute;