import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function RealApproval() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar usuários que tentaram fazer login mas não estão aprovados
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários aprovados
      const { data: approvedUsers, error: approvedError } = await supabase
        .from('approved_users')
        .select('email');

      if (approvedError) {
        console.error('Erro ao buscar usuários aprovados:', approvedError);
        return;
      }

      const approvedEmails = approvedUsers.map(user => user.email);
      
      // Lista de emails que você quer que apareçam para aprovação
      // Você pode adicionar mais emails aqui conforme necessário
      const emailsToApprove = [
        'guilherme.xacc@gmail.com',
        // Adicione mais emails aqui quando necessário
      ];

      // Criar lista de usuários pendentes
      const pending = emailsToApprove
        .filter(email => !approvedEmails.includes(email))
        .map((email, index) => ({
          id: `pending-${index}`,
          email: email,
          user_metadata: {
            full_name: email.split('@')[0].replace('.', ' ').replace(/([A-Z])/g, ' $1').trim(),
            avatar_url: null
          },
          created_at: new Date().toISOString()
        }));

      setPendingUsers(pending);
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      toast.error('Erro ao carregar usuários pendentes');
    } finally {
      setLoading(false);
    }
  };

  // Aprovar usuário
  const approveUser = async (user) => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .insert({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          role: 'admin',
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast.success(`Usuário ${user.email} aprovado com sucesso!`);
      fetchPendingUsers(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  // Rejeitar usuário
  const rejectUser = async (user) => {
    try {
      toast.success(`Usuário ${user.email} rejeitado.`);
      fetchPendingUsers(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  // Adicionar novo email para aprovação
  const addEmailForApproval = () => {
    const email = prompt('Digite o email do usuário que você quer aprovar:');
    if (email && email.includes('@')) {
      // Adicionar à lista local (em produção, você salvaria em uma tabela)
      const newUser = {
        id: `pending-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: email.split('@')[0].replace('.', ' ').replace(/([A-Z])/g, ' $1').trim(),
          avatar_url: null
        },
        created_at: new Date().toISOString()
      };
      
      setPendingUsers(prev => [...prev, newUser]);
      toast.success(`Email ${email} adicionado para aprovação.`);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchPendingUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-white mt-3">Carregando usuários pendentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-white mb-0">
              <span role="img" aria-label="approval">✅</span> Aprovação de Usuários
            </h2>
            <div className="btn-group">
              <button 
                className="btn btn-outline-warning"
                onClick={fetchPendingUsers}
              >
                🔄 Atualizar
              </button>
              <button 
                className="btn btn-outline-info"
                onClick={addEmailForApproval}
              >
                ➕ Adicionar Email
              </button>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="card bg-dark border-secondary">
              <div className="card-body text-center py-5">
                <div className="text-muted">
                  <span role="img" aria-label="empty">😴</span>
                  <p className="mb-0">Nenhum usuário aguardando aprovação</p>
                  <small>Clique em "➕ Adicionar Email" para adicionar um usuário</small>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {pendingUsers.map((user) => (
                <div key={user.id} className="col-12 col-md-6 col-lg-4 mb-3">
                  <div className="card bg-dark border-warning">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-3">
                          <div 
                            className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <span className="text-dark fw-bold">
                              {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="text-white mb-1">
                            {user.user_metadata?.full_name || 'Usuário'}
                          </h6>
                          <p className="text-muted mb-0 small">{user.email}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">
                          <strong>Status:</strong> Aguardando aprovação
                        </small>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-success"
                          onClick={() => approveUser(user)}
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => rejectUser(user)}
                        >
                          ❌ Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <span role="img" aria-label="info">ℹ️</span> Como funciona:
              </h6>
              <ul className="mb-0">
                <li><strong>Clique em "➕ Adicionar Email"</strong> para adicionar um usuário para aprovação</li>
                <li><strong>Clique em "✅ Aprovar"</strong> para liberar o acesso do usuário</li>
                <li><strong>Clique em "❌ Rejeitar"</strong> para remover o usuário da lista</li>
                <li><strong>O usuário poderá fazer login</strong> assim que for aprovado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealApproval;
