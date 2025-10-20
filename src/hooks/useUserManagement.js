import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar usuário
  const addUser = async (userData, authUser) => {
    try {
      setIsAddingUser(true);
      const { error } = await supabase
        .from('approved_users')
        .insert({
          email: userData.email.trim(),
          name: userData.name.trim(),
          role: 'admin',
          is_approved: true,
          approved_by: authUser.id
        });

      if (error) throw error;

      toast.success('Usuário adicionado com sucesso!');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      if (error.message.includes('duplicate key')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao adicionar usuário');
      }
      return false;
    } finally {
      setIsAddingUser(false);
    }
  };

  // Alterar status de aprovação
  const toggleUserApproval = async (userId, currentStatus, authUser) => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .update({ 
          is_approved: !currentStatus,
          approved_by: authUser.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Usuário ${!currentStatus ? 'aprovado' : 'desaprovado'} com sucesso!`);
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar aprovação:', error);
      toast.error('Erro ao alterar aprovação do usuário');
    }
  };

  // Excluir usuário
  const deleteUser = async (userId, userEmail) => {
    if (userEmail === 'guilhermesf.beasss@gmail.com') {
      toast.error('Não é possível excluir o usuário principal');
      return false;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('approved_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    isAddingUser,
    addUser,
    toggleUserApproval,
    deleteUser,
    refreshUsers: fetchUsers
  };
}
