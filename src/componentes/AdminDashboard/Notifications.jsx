import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth.jsx';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    
    // Configurar real-time para notificações
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Nova notificação:', payload.new);
          fetchNotifications();
          toast.info('Nova notificação recebida!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
        p_user_name: userEmail.split('@')[0], // Nome baseado no email
        p_user_role: 'admin'
      });

      if (error) {
        throw error;
      }

      fetchNotifications();
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

  const getNotificationColor = (type) => {
    switch (type) {
      case 'unauthorized_access':
        return 'danger';
      case 'new_user_request':
        return 'warning';
      default:
        return 'info';
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
              <span role="img" aria-label="notifications">🔔</span> Notificações
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount}</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

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

          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <span role="img" aria-label="info">ℹ️</span> Como funciona:
              </h6>
              <ul className="mb-0">
                <li><strong>Automático:</strong> Notificações são criadas quando alguém tenta fazer login</li>
                <li><strong>Detalhes completos:</strong> Email, IP, data/hora, motivo do bloqueio</li>
                <li><strong>Aprovação rápida:</strong> Clique em "✅ Aprovar" para liberar acesso</li>
                <li><strong>Rejeição:</strong> Clique em "❌ Rejeitar" para negar acesso</li>
                <li><strong>Tempo real:</strong> Notificações aparecem instantaneamente</li>
                <li><strong>Workflow:</strong> Peça para o usuário tentar login → Você recebe notificação → Aprove/Rejeite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
