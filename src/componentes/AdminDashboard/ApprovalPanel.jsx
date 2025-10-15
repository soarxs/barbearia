import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth.jsx';
import LoadingSpinner from '@/components/LoadingSpinner';

function ApprovalPanel() {
  const { user: authUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Verificar se é o admin principal
  const isMainAdmin = authUser && authUser.email === 'guilhermesf.beasss@gmail.com';

  // Buscar solicitações pendentes
  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('request_date', { ascending: false });

      if (error) {
        throw error;
      }

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

      if (error) {
        throw error;
      }

      setApprovedUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários aprovados:', error);
      toast.error('Erro ao carregar usuários aprovados');
    }
  };

  // Aprovar usuário (versão simples)
  const approveUser = async (request) => {
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

      if (updateError) {
        throw updateError;
      }

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

      if (insertError) {
        throw insertError;
      }

      toast.success(`✅ Usuário ${request.user_email} aprovado com sucesso!`);
      fetchPendingRequests();
      fetchApprovedUsers();
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  // Rejeitar usuário (versão simples)
  const rejectUser = async (request) => {
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

      if (updateError) {
        throw updateError;
      }

      // Desativar na lista de aprovados se existir
      const { error: deactivateError } = await supabase
        .from('approved_admins')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('user_email', request.user_email);

      if (deactivateError) {
        console.error('Erro ao desativar usuário:', deactivateError);
      }

      toast.success(`❌ Usuário ${request.user_email} rejeitado.`);
      fetchPendingRequests();
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  // Revogar acesso
  const revokeAccess = async (user) => {
    if (!confirm(`Tem certeza que deseja revogar o acesso de ${user.user_email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('approved_admins')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success(`🚫 Acesso de ${user.user_email} revogado.`);
      fetchApprovedUsers();
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      toast.error('Erro ao revogar acesso');
    }
  };

  // Carregar dados
  useEffect(() => {
    if (isMainAdmin) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchPendingRequests(),
          fetchApprovedUsers()
        ]);
        setLoading(false);
      };

      loadData();

      // Atualizar a cada 30 segundos
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isMainAdmin]);

  if (!isMainAdmin) {
    return (
      <div className="container-fluid mt-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4 className="alert-heading">🚫 Acesso Negado!</h4>
          <p>Você não tem permissão para acessar este painel administrativo.</p>
          <hr />
          <p className="mb-0">Apenas o administrador principal pode gerenciar aprovações.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-white mb-0">
              <span role="img" aria-label="approval">🔔</span> Painel de Aprovações
            </h2>
            <div className="btn-group">
              <button 
                className="btn btn-outline-warning"
                onClick={() => {
                  fetchPendingRequests();
                  fetchApprovedUsers();
                }}
              >
                🔄 Atualizar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                ⏳ Pendentes ({pendingRequests.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                ✅ Aprovados ({approvedUsers.length})
              </button>
            </li>
          </ul>

          {/* Conteúdo das Tabs */}
          {activeTab === 'pending' && (
            <div>
              <h3 className="text-white mb-3">Solicitações Pendentes</h3>
              {pendingRequests.length === 0 ? (
                <div className="card bg-dark border-secondary">
                  <div className="card-body text-center py-5">
                    <div className="text-muted">
                      <span role="img" aria-label="empty">😴</span>
                      <p className="mb-0">Nenhuma solicitação pendente</p>
                      <small>O sistema está monitorando automaticamente</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="col-12 col-md-6 col-lg-4 mb-3">
                      <div className="card bg-dark border-warning h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-center mb-3">
                            {request.profile_photo_url ? (
                              <img
                                src={request.profile_photo_url}
                                alt="Avatar"
                                className="rounded-circle me-3"
                                width="50"
                                height="50"
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                                style={{ width: '50px', height: '50px' }}
                              >
                                <span className="text-dark fw-bold">
                                  {(request.full_name || request.user_email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h6 className="card-title text-white mb-0">
                                {request.full_name || 'Usuário'}
                              </h6>
                              <p className="card-text text-muted mb-0">{request.user_email}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>Solicitado em:</strong><br />
                              {new Date(request.request_date).toLocaleString('pt-BR')}
                            </small>
                            {request.ip_address && (
                              <div className="mt-1">
                                <small className="text-muted">
                                  <strong>IP:</strong> {request.ip_address}
                                </small>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto">
                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-success"
                                onClick={() => approveUser(request)}
                              >
                                ✅ Aprovar
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => rejectUser(request)}
                              >
                                ❌ Rejeitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              <h3 className="text-white mb-3">Usuários Aprovados</h3>
              {approvedUsers.length === 0 ? (
                <div className="card bg-dark border-secondary">
                  <div className="card-body text-center py-5">
                    <div className="text-muted">
                      <span role="img" aria-label="empty">👥</span>
                      <p className="mb-0">Nenhum usuário aprovado</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {approvedUsers.map((user) => (
                    <div key={user.id} className="col-12 col-md-6 col-lg-4 mb-3">
                      <div className="card bg-dark border-success h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-center mb-3">
                            {user.profile_photo_url ? (
                              <img
                                src={user.profile_photo_url}
                                alt="Avatar"
                                className="rounded-circle me-3"
                                width="50"
                                height="50"
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3"
                                style={{ width: '50px', height: '50px' }}
                              >
                                <span className="text-white fw-bold">
                                  {(user.full_name || user.user_email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h6 className="card-title text-white mb-0">
                                {user.full_name || 'Usuário'}
                              </h6>
                              <p className="card-text text-muted mb-0">{user.user_email}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>Aprovado em:</strong><br />
                              {new Date(user.approved_at).toLocaleString('pt-BR')}
                            </small>
                            <div className="mt-1">
                              <small className="text-muted">
                                <strong>Por:</strong> {user.approved_by}
                              </small>
                            </div>
                          </div>

                          <div className="mt-auto">
                            {user.user_email !== 'guilhermesf.beasss@gmail.com' && (
                              <button
                                className="btn btn-outline-danger btn-sm w-100"
                                onClick={() => revokeAccess(user)}
                              >
                                🚫 Revogar Acesso
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="mt-5">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <span role="img" aria-label="info">ℹ️</span> Como funciona:
              </h6>
              <ul className="mb-0">
                <li><strong>Usuário tenta login</strong> → Aparece automaticamente em "Pendentes"</li>
                <li><strong>Você vê as credenciais</strong> → Nome, email, foto e IP</li>
                <li><strong>Clique em "✅ Aprovar"</strong> → Usuário pode acessar /admin</li>
                <li><strong>Clique em "❌ Rejeitar"</strong> → Usuário é bloqueado</li>
                <li><strong>Usuários aprovados</strong> → Podem ser revogados a qualquer momento</li>
                <li><strong>Sistema atualiza automaticamente</strong> a cada 30 segundos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalPanel;
