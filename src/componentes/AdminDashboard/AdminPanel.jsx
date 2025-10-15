import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth.jsx';

function AdminPanel() {
  const [notifications, setNotifications] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('verification');
  const { user } = useAuth();

  // Verificar se é o admin principal
  const isMainAdmin = user && user.email === 'guilhermesf.beasss@gmail.com';

  useEffect(() => {
    if (!isMainAdmin) {
      toast.error('Acesso negado. Apenas o administrador principal pode acessar esta página.');
      return;
    }

    fetchData();
    
    // Configurar real-time para notificações
    const channel = supabase
      .channel('admin-panel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Nova notificação:', payload.new);
          fetchNotifications();
          toast.info('Nova notificação recebida!');
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'approved_users' },
        () => {
          fetchApprovedUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApprovedUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários aprovados:', error);
      toast.error('Erro ao carregar usuários aprovados');
    }
  };

  const fetchVerificationCodes = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_verification_codes');

      if (error) {
        throw error;
      }

      setVerificationCodes(data || []);
    } catch (error) {
      console.error('Erro ao buscar códigos de verificação:', error);
      toast.error('Erro ao carregar códigos de verificação');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      fetchNotifications();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      fetchNotifications();
      toast.success('Notificação excluída');
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const approveUser = async (notificationId, userEmail) => {
    try {
      const { error } = await supabase.rpc('approve_user_from_notification', {
        p_notification_id: notificationId,
        p_user_email: userEmail,
        p_user_name: userEmail.split('@')[0],
        p_user_role: 'admin'
      });

      if (error) {
        throw error;
      }

      fetchNotifications();
      fetchApprovedUsers();
      toast.success(`Usuário ${userEmail} aprovado com sucesso!`);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário');
    }
  };

  const rejectUser = async (notificationId, userEmail) => {
    try {
      const { error } = await supabase.rpc('reject_user_from_notification', {
        p_notification_id: notificationId,
        p_user_email: userEmail,
        p_reason: 'Acesso negado pelo administrador'
      });

      if (error) {
        throw error;
      }

      fetchNotifications();
      toast.success(`Usuário ${userEmail} rejeitado`);
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  };

  const revokeUserAccess = async (userId) => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .update({ is_approved: false })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      fetchApprovedUsers();
      toast.success('Acesso do usuário revogado');
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      toast.error('Erro ao revogar acesso do usuário');
    }
  };

  const approveVerificationCode = async (code) => {
    try {
      const { data, error } = await supabase.rpc('approve_verification_code', {
        p_code: code
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        fetchVerificationCodes();
        toast.success(`Código ${code} aprovado! Usuário ${data.user_name} pode fazer login.`);
      } else {
        toast.error(data.error || 'Erro ao aprovar código');
      }
    } catch (error) {
      console.error('Erro ao aprovar código:', error);
      toast.error('Erro ao aprovar código de verificação');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'unauthorized_access':
        return '🚫';
      case 'new_user_request':
        return '👤';
      default:
        return '🔔';
    }
  };

  if (!isMainAdmin) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card bg-dark border-danger">
              <div className="card-body text-center py-5">
                <h2 className="text-danger mb-3">🔒 Acesso Negado</h2>
                <p className="text-muted">Esta página é restrita apenas ao administrador principal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span role="img" aria-label="admin">👑</span> Painel Administrativo
            </h2>
            <div className="btn-group" role="group">
              <button
                className={`btn ${activeTab === 'verification' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setActiveTab('verification')}
              >
                🔐 Códigos de Verificação
                {verificationCodes.length > 0 && (
                  <span className="badge bg-danger ms-2">{verificationCodes.length}</span>
                )}
              </button>
              <button
                className={`btn ${activeTab === 'notifications' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setActiveTab('notifications')}
              >
                🔔 Notificações
                {unreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{unreadCount}</span>
                )}
              </button>
              <button
                className={`btn ${activeTab === 'users' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Usuários Aprovados
              </button>
            </div>
          </div>

          {/* Aba de Códigos de Verificação */}
          {activeTab === 'verification' && (
            <div>
              {verificationCodes.length === 0 ? (
                <div className="card bg-dark border-secondary">
                  <div className="card-body text-center py-5">
                    <div className="text-muted">
                      <span role="img" aria-label="empty">🔐</span>
                      <p className="mb-0">Nenhum código de verificação pendente</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {verificationCodes.map((verification) => (
                    <div key={verification.id} className="col-12 mb-3">
                      <div className="card bg-dark border-warning">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <span className="fs-4 me-2">🔐</span>
                                <h6 className="text-warning mb-0 fw-bold">
                                  Código de Verificação: {verification.code}
                                </h6>
                                <span className="badge bg-warning text-dark ms-2">Pendente</span>
                              </div>
                              <div className="mb-2">
                                <p className="text-white mb-1">
                                  <strong>Nome:</strong> {verification.user_name || 'Não informado'}
                                </p>
                                <p className="text-white mb-1">
                                  <strong>Email:</strong> {verification.email}
                                </p>
                                <p className="text-muted mb-0">
                                  <strong>Solicitado em:</strong> {new Date(verification.created_at).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-muted mb-0">
                                  <strong>Expira em:</strong> {new Date(verification.expires_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="btn-group-vertical" role="group">
                              <button
                                className="btn btn-success btn-sm mb-1"
                                onClick={() => approveVerificationCode(verification.code)}
                                title="Aprovar código"
                              >
                                ✅ Aprovar
                              </button>
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(verification.code);
                                  toast.success('Código copiado para a área de transferência!');
                                }}
                                title="Copiar código"
                              >
                                📋 Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <div className="alert alert-warning">
                  <h6 className="alert-heading">
                    <span role="img" aria-label="info">ℹ️</span> Como funciona:
                  </h6>
                  <ul className="mb-0">
                    <li><strong>Usuário tenta login:</strong> Sistema gera código automaticamente</li>
                    <li><strong>Você recebe notificação:</strong> Email com nome, email e código</li>
                    <li><strong>Aprove o código:</strong> Clique em "✅ Aprovar"</li>
                    <li><strong>Usuário insere código:</strong> Na tela de verificação</li>
                    <li><strong>Acesso liberado:</strong> Usuário é aprovado automaticamente</li>
                    <li><strong>Código expira:</strong> Em 30 minutos se não usado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Aba de Notificações */}
          {activeTab === 'notifications' && (
            <div>
              {unreadCount > 0 && (
                <div className="mb-3">
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={markAllAsRead}
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="card bg-dark border-secondary">
                  <div className="card-body text-center py-5">
                    <div className="text-muted">
                      <span role="img" aria-label="empty">📭</span>
                      <p className="mb-0">Nenhuma notificação encontrada</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="col-12 mb-3">
                      <div className={`card bg-dark border-secondary ${!notification.is_read ? 'border-warning' : ''}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <span className="fs-4 me-2">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <h6 className={`text-white mb-0 ${!notification.is_read ? 'fw-bold' : ''}`}>
                                  {notification.title}
                                </h6>
                                {!notification.is_read && (
                                  <span className="badge bg-warning ms-2">Nova</span>
                                )}
                              </div>
                              <p className="text-muted mb-2">{notification.message}</p>
                              <div className="d-flex align-items-center text-muted small">
                                <span className="me-3">
                                  <strong>Email:</strong> {notification.email}
                                </span>
                                {notification.ip_address && (
                                  <span className="me-3">
                                    <strong>IP:</strong> {notification.ip_address}
                                  </span>
                                )}
                                <span>
                                  <strong>Data:</strong> {new Date(notification.created_at).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <div className="btn-group-vertical" role="group">
                              {/* Botões de Aprovar/Rejeitar para solicitações de acesso */}
                              {notification.type === 'new_user_request' && !notification.is_read && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm mb-1"
                                    onClick={() => approveUser(notification.id, notification.email)}
                                    title="Aprovar usuário"
                                  >
                                    ✅ Aprovar
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm mb-1"
                                    onClick={() => rejectUser(notification.id, notification.email)}
                                    title="Rejeitar usuário"
                                  >
                                    ❌ Rejeitar
                                  </button>
                                </>
                              )}
                              
                              {!notification.is_read && (
                                <button
                                  className="btn btn-outline-success btn-sm mb-1"
                                  onClick={() => markAsRead(notification.id)}
                                  title="Marcar como lida"
                                >
                                  ✓
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => deleteNotification(notification.id)}
                                title="Excluir"
                              >
                                🗑️
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

          {/* Aba de Usuários Aprovados */}
          {activeTab === 'users' && (
            <div>
              {approvedUsers.length === 0 ? (
                <div className="card bg-dark border-secondary">
                  <div className="card-body text-center py-5">
                    <div className="text-muted">
                      <span role="img" aria-label="empty">👥</span>
                      <p className="mb-0">Nenhum usuário aprovado encontrado</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {approvedUsers.map((user) => (
                    <div key={user.id} className="col-12 mb-3">
                      <div className="card bg-dark border-secondary">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="text-white mb-1">
                                {user.name || user.email}
                                {user.is_approved && (
                                  <span className="badge bg-success ms-2">Aprovado</span>
                                )}
                              </h6>
                              <p className="text-muted mb-1">
                                <strong>Email:</strong> {user.email}
                              </p>
                              <p className="text-muted mb-0">
                                <strong>Função:</strong> {user.role}
                              </p>
                              {user.approved_at && (
                                <p className="text-muted mb-0">
                                  <strong>Aprovado em:</strong> {new Date(user.approved_at).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                            <div>
                              {user.email !== 'guilhermesf.beasss@gmail.com' && (
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => revokeUserAccess(user.id)}
                                  title="Revogar acesso"
                                >
                                  🚫 Revogar
                                </button>
                              )}
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

          {/* Instruções */}
          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <span role="img" aria-label="info">ℹ️</span> Como funciona:
              </h6>
              <ul className="mb-0">
                <li><strong>Notificações:</strong> Aparecem quando alguém tenta fazer login</li>
                <li><strong>Aprovação:</strong> Clique em "✅ Aprovar" para liberar acesso</li>
                <li><strong>Rejeição:</strong> Clique em "❌ Rejeitar" para negar acesso</li>
                <li><strong>Usuários:</strong> Veja todos os usuários aprovados</li>
                <li><strong>Revogação:</strong> Remova acesso de usuários aprovados</li>
                <li><strong>Privacidade:</strong> Apenas você tem acesso a esta página</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
