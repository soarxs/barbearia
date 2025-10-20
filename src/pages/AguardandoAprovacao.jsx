import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth.jsx';
import LoadingSpinner from '@/components/LoadingSpinner';

function AguardandoAprovacao() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState(0);

  // Verificar status de aprovação (versão simples)
  const checkApprovalStatus = async () => {
    if (!user?.email) {
      setStatus('error');
      return;
    }

    try {
      // Verificar se está aprovado
      const { data: approvedData, error: approvedError } = await supabase
        .from('approved_admins')
        .select('*')
        .eq('user_email', user.email)
        .eq('active', true)
        .single();

      if (approvedData) {
        setStatus('approved');
        setCountdown(3);
        setUserInfo({
          fullName: approvedData.full_name || user.user_metadata?.full_name,
          profilePhoto: approvedData.profile_photo_url || user.user_metadata?.avatar_url,
          requestDate: approvedData.approved_at
        });
        return;
      }

      // Verificar se tem solicitação pendente
      const { data: requestData, error: requestError } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('user_email', user.email)
        .single();

      if (requestData) {
        setUserInfo({
          fullName: requestData.full_name || user.user_metadata?.full_name,
          profilePhoto: requestData.profile_photo_url || user.user_metadata?.avatar_url,
          requestDate: requestData.request_date
        });

        if (requestData.status === 'rejected') {
          setStatus('rejected');
        } else {
          setStatus('pending');
        }
      } else {
        setStatus('pending');
        setUserInfo({
          fullName: user.user_metadata?.full_name,
          profilePhoto: user.user_metadata?.avatar_url,
          requestDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus('error');
    }
  };

  // Polling automático a cada 10 segundos
  useEffect(() => {
    checkApprovalStatus();
    
    const interval = setInterval(checkApprovalStatus, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Countdown para redirecionamento
  useEffect(() => {
    if (status === 'approved' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'approved' && countdown === 0) {
      navigate('/admin/agenda', { replace: true });
    }
  }, [status, countdown, navigate]);

  // Bloquear acesso às rotas admin
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname.startsWith('/admin') && status !== 'approved') {
        navigate('/aguardando-aprovacao', { replace: true });
      }
    };

    // Verificar a cada mudança de rota
    const interval = setInterval(handleRouteChange, 1000);
    return () => clearInterval(interval);
  }, [status, navigate]);

  // Função para sair da conta
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white">
        <LoadingSpinner />
        <p className="mt-3">Verificando status de aprovação...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white text-center p-4">
        <div className="alert alert-danger">
          <h4 className="alert-heading">❌ Erro</h4>
          <p>Ocorreu um erro ao verificar seu status de aprovação.</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={handleSignOut}>
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white text-center p-4">
      <div className="card bg-dark border-secondary" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5">
          {/* Logo da Empresa */}
          <div className="mb-4">
            <h2 className="text-blue mb-0">💈 BarberTime</h2>
            <p className="text-muted">Sistema de Gestão</p>
          </div>

          {/* Status Visual */}
          <div className="mb-4">
            {status === 'pending' && (
              <div className="text-warning">
                <div className="display-1">⏳</div>
                <h3>Aguardando Aprovação</h3>
              </div>
            )}
            {status === 'approved' && (
              <div className="text-success">
                <div className="display-1">✅</div>
                <h3>Acesso Aprovado!</h3>
              </div>
            )}
            {status === 'rejected' && (
              <div className="text-danger">
                <div className="display-1">❌</div>
                <h3>Acesso Negado</h3>
              </div>
            )}
          </div>

          {/* Informações do Usuário */}
          {userInfo && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                {userInfo.profilePhoto ? (
                  <img
                    src={userInfo.profilePhoto}
                    alt="Foto do perfil"
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <span className="text-white fs-4">
                      {(userInfo.fullName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-start">
                  <h5 className="mb-1">{userInfo.fullName || 'Usuário'}</h5>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagens de Status */}
          {status === 'pending' && (
            <div className="mb-4">
              <p className="lead">
                Sua solicitação foi enviada para o administrador.
              </p>
              <p className="text-muted">
                Você receberá uma notificação quando for aprovada.
              </p>
              <div className="alert alert-info">
                <small>
                  <strong>Status:</strong> Pendente<br />
                  <strong>Solicitado em:</strong> {userInfo?.requestDate ? 
                    new Date(userInfo.requestDate).toLocaleString('pt-BR') : 
                    'Agora'
                  }
                </small>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div className="mb-4">
              <p className="lead text-success">
                Parabéns! Seu acesso foi aprovado.
              </p>
              <p className="text-muted">
                Redirecionando para o painel administrativo em {countdown} segundos...
              </p>
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Redirecionando...</span>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="mb-4">
              <p className="lead text-danger">
                Seu acesso foi negado.
              </p>
              <p className="text-muted">
                Entre em contato com o administrador para mais informações.
              </p>
              <div className="alert alert-danger">
                <small>
                  <strong>Status:</strong> Negado<br />
                  <strong>Revisado em:</strong> {userInfo?.reviewedAt ? 
                    new Date(userInfo.reviewedAt).toLocaleString('pt-BR') : 
                    'Recentemente'
                  }
                </small>
              </div>
            </div>
          )}

          {/* Botão de Sair */}
          <div className="mt-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleSignOut}
            >
              Sair da Conta
            </button>
          </div>

          {/* Informações de Segurança */}
          <div className="mt-4">
            <small className="text-muted">
              <i className="fas fa-shield-alt me-1"></i>
              Sistema protegido - Acesso restrito a usuários aprovados
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AguardandoAprovacao;
