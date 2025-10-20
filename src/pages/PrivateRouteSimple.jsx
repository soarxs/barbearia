import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

function PrivateRoute({ children }) {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [checkingApproval, setCheckingApproval] = useState(false);

  // Verificar status de aprovação
  const checkApprovalStatus = async () => {
    if (!user?.email) {
      setApprovalStatus(null);
      return;
    }

    setCheckingApproval(true);
    try {
      // Admin principal sempre tem acesso
      if (user.email === 'guilhermesf.beasss@gmail.com') {
        setApprovalStatus({ status: 'approved', isApproved: true });
        setCheckingApproval(false);
        return;
      }

      // Verificar se está na tabela de aprovados
      const { data, error } = await supabase
        .from('approved_admins')
        .select('active')
        .eq('user_email', user.email)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar aprovação:', error);
        setApprovalStatus({ status: 'error', isApproved: false });
        return;
      }

      const isApproved = data?.active || false;
      setApprovalStatus({ status: isApproved ? 'approved' : 'pending', isApproved });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setApprovalStatus({ status: 'error', isApproved: false });
    } finally {
      setCheckingApproval(false);
    }
  };

  // Criar solicitação de acesso se não existir
  const createAccessRequest = async () => {
    if (!user?.email) return;

    try {
      await supabase
        .from('admin_access_requests')
        .upsert({
          user_email: user.email,
          full_name: user.user_metadata?.full_name || null,
          profile_photo_url: user.user_metadata?.avatar_url || null,
          status: 'pending'
        });
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkApprovalStatus();
      
      // Verificar a cada 30 segundos
      const interval = setInterval(checkApprovalStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Mostrar loading enquanto verifica autenticação ou aprovação
  if (loading || checkingApproval) {
    return <LoadingSpinner />;
  }

  // Se não há usuário, redirecionar para login
  if (!user) {
    localStorage.removeItem('bt_admin_auth');
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Se não tem status ainda, aguardar
  if (!approvalStatus) {
    return <LoadingSpinner />;
  }

  // Se deu erro, mostrar erro
  if (approvalStatus.status === 'error') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white text-center p-4">
        <div className="alert alert-danger">
          <h4 className="alert-heading">❌ Erro</h4>
          <p>Ocorreu um erro ao verificar seu status de aprovação.</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={signOut}>
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  // Se não está aprovado, criar solicitação e redirecionar
  if (!approvalStatus.isApproved) {
    createAccessRequest();
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Se está aprovado, permitir acesso
  return children;
}

export default PrivateRoute;
