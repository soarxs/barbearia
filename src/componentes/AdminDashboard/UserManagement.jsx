import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth.jsx';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    
    if (!newUserEmail.trim() || !newUserName.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setIsAddingUser(true);
      const { error } = await supabase
        .from('approved_users')
        .insert({
          email: newUserEmail.trim(),
          name: newUserName.trim(),
          role: 'admin',
          is_approved: true,
          approved_by: user.id
        });

      if (error) {
        throw error;
      }

      toast.success('Usuário adicionado com sucesso!');
      setNewUserEmail('');
      setNewUserName('');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      if (error.message.includes('duplicate key')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao adicionar usuário');
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  const toggleUserApproval = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .update({ 
          is_approved: !currentStatus,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast.success(`Usuário ${!currentStatus ? 'aprovado' : 'desaprovado'} com sucesso!`);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar aprovação:', error);
      toast.error('Erro ao alterar aprovação do usuário');
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (userEmail === 'guilhermesf.beasss@gmail.com') {
      toast.error('Não é possível excluir o usuário principal');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('approved_users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast.success('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-white mb-0">
              <span role="img" aria-label="users">👥</span> Gerenciar Usuários
            </h2>
          </div>

          {/* Formulário para adicionar usuário */}
          <div className="card bg-dark border-secondary mb-4">
            <div className="card-header bg-secondary">
              <h5 className="text-white mb-0">
                <span role="img" aria-label="add">➕</span> Adicionar Novo Usuário
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={addUser}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Nome</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nome do usuário"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Email</label>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-secondary"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isAddingUser}
                >
                  {isAddingUser ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <span role="img" aria-label="add">➕</span> Adicionar Usuário
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de usuários */}
          <div className="card bg-dark border-secondary">
            <div className="card-header bg-secondary">
              <h5 className="text-white mb-0">
                <span role="img" aria-label="list">📋</span> Usuários Cadastrados ({users.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {users.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Nenhum usuário cadastrado</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Data de Criação</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>{userItem.name}</td>
                          <td>{userItem.email}</td>
                          <td>
                            <span className={`badge ${userItem.is_approved ? 'bg-success' : 'bg-warning'}`}>
                              {userItem.is_approved ? 'Aprovado' : 'Pendente'}
                            </span>
                          </td>
                          <td>
                            {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => toggleUserApproval(userItem.id, userItem.is_approved)}
                                title={userItem.is_approved ? 'Desaprovar' : 'Aprovar'}
                              >
                                {userItem.is_approved ? '❌' : '✅'}
                              </button>
                              {userItem.email !== 'guilhermesf.beasss@gmail.com' && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteUser(userItem.id, userItem.email)}
                                  title="Excluir"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <span role="img" aria-label="info">ℹ️</span> Como funciona:
              </h6>
              <ul className="mb-0">
                <li>Usuários aprovados podem fazer login no sistema</li>
                <li>Usuários pendentes não conseguem acessar</li>
                <li>O usuário principal não pode ser excluído</li>
                <li>Novos usuários são aprovados automaticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
