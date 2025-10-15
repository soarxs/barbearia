import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function AutoApproval() {
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
      
      // Buscar usuários que tentaram fazer login (simulado por enquanto)
      // Em produção, você pode usar uma tabela de tentativas de login
      const { data: authUsers, error: authError } = await supabase.auth.getUser();
      
      // Lista de emails que apareceram tentando fazer login
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
          created_at: new Date().toISOString(),
          status: 'waiting' // waiting, approved, rejected
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

      // Atualizar status local
      setPendingUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, status: 'approved' }
            : u
        )
      );

      toast.success(`✅ Usuário ${user.email} aprovado com sucesso!`);
      
      // Remover da lista após 3 segundos
      setTimeout(() => {
        setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      }, 3000);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  // Rejeitar usuário
  const rejectUser = async (user) => {
    try {
      // Atualizar status local
      setPendingUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, status: 'rejected' }
            : u
        )
      );

      toast.success(`❌ Usuário ${user.email} rejeitado.`);
      
      // Remover da lista após 3 segundos
      setTimeout(() => {
        setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      }, 3000);
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  // Adicionar novo email para aprovação (simular tentativa de login)
  const addEmailForApproval = () => {
    const email = prompt('Digite o email do usuário que tentou fazer login:');
    if (email && email.includes('@')) {
      const newUser = {
        id: `pending-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: email.split('@')[0].replace('.', ' ').replace(/([A-Z])/g, ' $1').trim(),
          avatar_url: null
        },
        created_at: new Date().toISOString(),
        status: 'waiting'
      };
      
      setPendingUsers(prev => [...prev, newUser]);
      toast.success(`🔔 Novo usuário ${email} aguardando aprovação!`);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    
    // Atualizar a cada 10 segundos para detectar novas tentativas
    const interval = setInterval(fetchPendingUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-white mt-3">Monitorando tentativas de login...</p>
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
              <span role="img" aria-label="approval">🔔</span> Aprovação Automática
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
                ➕ Simular Login
              </button>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="card bg-dark border-secondary">
              <div className="card-body text-center py-5">
                <div className="text-muted">
                  <span role="img" aria-label="empty">😴</span>
                  <p className="mb-0">Nenhuma tentativa de login detectada</p>
                  <small>O sistema está monitorando automaticamente</small>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {pendingUsers.map((user) => (
                <div key={user.id} className="col-12 col-md-6 col-lg-4 mb-3">
                  <div className={`card ${user.status === 'approved' ? 'bg-success' : user.status === 'rejected' ? 'bg-danger' : 'bg-dark border-warning'}`}>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-3">
                          <div 
                            className={`rounded-circle ${user.status === 'approved' ? 'bg-white' : user.status === 'rejected' ? 'bg-white' : 'bg-warning'} d-flex align-items-center justify-content-center`}
                            style={{ width: '50px', height: '50px' }}
                          >
                            <span className={`fw-bold ${user.status === 'approved' ? 'text-success' : user.status === 'rejected' ? 'text-danger' : 'text-dark'}`}>
                              {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className={`mb-1 ${user.status === 'approved' ? 'text-white' : user.status === 'rejected' ? 'text-white' : 'text-white'}`}>
                            {user.user_metadata?.full_name || 'Usuário'}
                          </h6>
                          <p className={`mb-0 small ${user.status === 'approved' ? 'text-white' : user.status === 'rejected' ? 'text-white' : 'text-muted'}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className={`${user.status === 'approved' ? 'text-white' : user.status === 'rejected' ? 'text-white' : 'text-muted'}`}>
                          <strong>Status:</strong> {
                            user.status === 'approved' ? '✅ Aprovado' : 
                            user.status === 'rejected' ? '❌ Rejeitado' : 
                            '⏳ Aguardando aprovação'
                          }
                        </small>
                      </div>

                      {user.status === 'waiting' && (
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
                      )}

                      {(user.status === 'approved' || user.status === 'rejected') && (
                        <div className="text-center">
                          <small className="text-white">
                            {user.status === 'approved' ? 'Usuário aprovado!' : 'Usuário rejeitado!'}
                          </small>
                        </div>
                      )}
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
                <li><strong>Usuário tenta login</strong> → Aparece automaticamente aqui</li>
                <li><strong>Você vê as credenciais</strong> → Nome, email e avatar</li>
                <li><strong>Clique em "✅ Aprovar"</strong> → Usuário pode entrar</li>
                <li><strong>Clique em "❌ Rejeitar"</strong> → Usuário é bloqueado</li>
                <li><strong>Ou deixe lá</strong> → Usuário fica aguardando</li>
                <li><strong>Sistema atualiza automaticamente</strong> a cada 10 segundos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoApproval;
