import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { username } = useAuth(); 

  if (!username) {
    return Navigate({ to: "/entrar" });
  }

  return Outlet({});
};

export default ProtectedRoute;