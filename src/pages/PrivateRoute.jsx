import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import LoadingSpinner from '@/components/LoadingSpinner';

function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, loading, isAdmin, isUserApproved } = useAuth();
  const [isApproved, setIsApproved] = useState(null);
  const [checkingApproval, setCheckingApproval] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      if (user && user.email) {
        setCheckingApproval(true);
        try {
          const approved = await isUserApproved(user.email);
          setIsApproved(approved);
        } catch (error) {
          console.error('Erro ao verificar aprovação:', error);
          setIsApproved(false);
        } finally {
          setCheckingApproval(false);
        }
      } else {
        setIsApproved(false);
      }
    };

    checkApproval();
  }, [user, isUserApproved]);

  // Mostrar loading enquanto verifica autenticação ou aprovação
  if (loading || checkingApproval) {
    return <LoadingSpinner />;
  }

  // Verificar se usuário está autenticado e é admin
  if (!user || !isAdmin()) {
    // Limpar localStorage para forçar login
    localStorage.removeItem('bt_admin_auth');
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

export default PrivateRoute;

