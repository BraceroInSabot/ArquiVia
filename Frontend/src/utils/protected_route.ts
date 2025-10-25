import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return React.createElement('p', null, 'Verificando autenticação...');
  }

  if (!user) {
    return React.createElement(Navigate, { to: '/entrar', replace: true });
  }

  return React.createElement(Outlet, null);
};

export default ProtectedRoute;