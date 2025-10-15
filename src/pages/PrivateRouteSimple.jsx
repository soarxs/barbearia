import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

function PrivateRouteSimple({ children }) {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [checkingApproval, setCheckingApproval] = useState(false);

  // Verificar se usuário está aprovado (versão simples)
  const checkApproval = async () => {
    if (!user?.email) return false;

    setCheckingApproval(true);
    try {
      // Verificar se é admin principal
      if (user.email === 'guilhermesf.beasss@gmail.com') {
        setCheckingApproval(false);
        return true;
      }

      // Verificar se está na tabela de aprovados
      const { data, error } = await supabase
        .from('approved_admins')
        .select('active')
        .eq('user_email', user.email)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao verificar aprovação:', error);
        setCheckingApproval(false);
        return false;
      }

      const isApproved = data?.active || false;
      setCheckingApproval(false);
      return isApproved;
    } catch (error) {
      console.error('Erro ao verificar aprovação:', error);
      setCheckingApproval(false);
      return false;
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkApproval();
    }
  }, [user]);

  // Mostrar loading enquanto verifica autenticação
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

  // Para outros usuários, verificar aprovação
  const isApproved = checkApproval();
  
  if (!isApproved) {
    // Criar solicitação se não existir
    const createRequest = async () => {
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

    createRequest();
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Se está aprovado, permitir acesso
  return children;
}

export default PrivateRouteSimple;
