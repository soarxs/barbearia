import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useApproval() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar solicitações pendentes
  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
      toast.error('Erro ao carregar solicitações pendentes');
    }
  };

  // Buscar usuários aprovados
  const fetchApprovedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_admins')
        .select('*')
        .eq('active', true)
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setApprovedUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários aprovados:', error);
      toast.error('Erro ao carregar usuários aprovados');
    }
  };

  // Aprovar usuário
  const approveUser = async (request, authUser) => {
    try {
      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('admin_access_requests')
        .update({
          status: 'approved',
          reviewed_by: authUser.email,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_email', request.user_email);

      if (updateError) throw updateError;

      // Adicionar à lista de aprovados
      const { error: insertError } = await supabase
        .from('approved_admins')
        .upsert({
          user_email: request.user_email,
          full_name: request.full_name,
          profile_photo_url: request.profile_photo_url,
          approved_by: authUser.email,
          active: true
        });

      if (insertError) throw insertError;

      toast.success(`✅ Usuário ${request.user_email} aprovado com sucesso!`);
      await Promise.all([fetchPendingRequests(), fetchApprovedUsers()]);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  // Rejeitar usuário
  const rejectUser = async (request, authUser) => {
    try {
      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('admin_access_requests')
        .update({
          status: 'rejected',
          reviewed_by: authUser.email,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_email', request.user_email);

      if (updateError) throw updateError;

      // Desativar na lista de aprovados se existir
      const { error: deactivateError } = await supabase
        .from('approved_admins')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('user_email', request.user_email);

      if (deactivateError) {
        console.error('Erro ao desativar usuário:', deactivateError);
      }

      toast.success(`❌ Usuário ${request.user_email} rejeitado.`);
      await fetchPendingRequests();
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  // Revogar acesso
  const revokeAccess = async (user) => {
    try {
      const { error } = await supabase
        .from('approved_admins')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`🚫 Acesso de ${user.user_email} revogado.`);
      await fetchApprovedUsers();
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      toast.error('Erro ao revogar acesso');
    }
  };

  // Carregar dados iniciais
  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPendingRequests(), fetchApprovedUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    pendingRequests,
    approvedUsers,
    loading,
    approveUser,
    rejectUser,
    revokeAccess,
    refreshData: loadData
  };
}
