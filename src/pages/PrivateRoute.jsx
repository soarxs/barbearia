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
  const [hasCreatedRequest, setHasCreatedRequest] = useState(false);

  // Verificar status de aprovação
  const checkApprovalStatus = async () => {
    if (!user?.email) {
      setApprovalStatus(null);
      return;
    }

    setCheckingApproval(true);
    try {
      const { data, error } = await supabase.rpc('get_user_approval_status', {
        user_email: user.email
      });

      if (error) {
        console.error('Erro ao verificar status:', error);
        // Se a função não existe ainda, tratar como não aprovado
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          setApprovalStatus({ status: 'not_found', isApproved: false });
        } else {
          setApprovalStatus({ status: 'error', isApproved: false });
        }
        return;
      }

      setApprovalStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setApprovalStatus({ status: 'error', isApproved: false });
    } finally {
      setCheckingApproval(false);
    }
  };

  // Criar solicitação de acesso se não existir
  const createAccessRequest = async () => {
    if (!user?.email || hasCreatedRequest) return;

    try {
      const { error } = await supabase.rpc('create_access_request', {
        p_user_email: user.email,
        p_full_name: user.user_metadata?.full_name || null,
        p_profile_photo_url: user.user_metadata?.avatar_url || null,
        p_ip_address: null // Será obtido pelo servidor
      });

      if (error) {
        console.error('Erro ao criar solicitação:', error);
        // Se a função não existe ainda, criar diretamente na tabela
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          const { error: insertError } = await supabase
            .from('admin_access_requests')
            .upsert({
              user_email: user.email,
              full_name: user.user_metadata?.full_name || null,
              profile_photo_url: user.user_metadata?.avatar_url || null,
              status: 'pending'
            });
          
          if (!insertError) {
            setHasCreatedRequest(true);
          }
        }
      } else {
        setHasCreatedRequest(true);
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkApprovalStatus();
      
      // Verificar a cada 10 segundos
      const interval = setInterval(checkApprovalStatus, 10000);
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

  // Admin principal sempre tem acesso
  if (user.email === 'guilhermesf.beasss@gmail.com') {
    return children;
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
    // Criar solicitação se ainda não foi criada
    if (!hasCreatedRequest && approvalStatus.status === 'not_found') {
      createAccessRequest();
    }

    // Redirecionar baseado no status
    if (approvalStatus.status === 'rejected') {
      return <Navigate to="/acesso-negado" replace />;
    } else {
      return <Navigate to="/aguardando-aprovacao" replace />;
    }
  }

  // Se está aprovado, permitir acesso
  return children;
}

export default PrivateRoute;