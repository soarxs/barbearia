import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from 'sonner';

export const useAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('verification');

  const isMainAdmin = user && user.email === 'guilhermesf.beasss@gmail.com';

  useEffect(() => {
    if (!isMainAdmin) {
      toast.error('Acesso negado. Apenas o administrador principal pode acessar esta página.');
      return;
    }

    fetchData();
    setupRealtime();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [isMainAdmin]);

  const fetchData = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchApprovedUsers(),
      fetchVerificationCodes()
    ]);
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read)?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApprovedUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários aprovados:', error);
    }
  };

  const fetchVerificationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVerificationCodes(data || []);
    } catch (error) {
      console.error('Erro ao buscar códigos de verificação:', error);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('admin-panel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
          toast.info('Nova notificação recebida!');
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'approved_users' },
        () => fetchApprovedUsers()
      )
      .subscribe();
  };

  const markNotificationAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .insert({ user_id: userId, approved_by: user.id });
      
      if (error) throw error;
      toast.success('Usuário aprovado com sucesso!');
      fetchApprovedUsers();
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  return {
    loading,
    notifications,
    approvedUsers,
    verificationCodes,
    unreadCount,
    activeTab,
    setActiveTab,
    isMainAdmin,
    markNotificationAsRead,
    approveUser,
    fetchData
  };
};
