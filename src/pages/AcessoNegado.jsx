import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';

function AcessoNegado() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Função para sair da conta
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  // Função para tentar novamente (vai para aguardando aprovação)
  const handleTryAgain = () => {
    navigate('/aguardando-aprovacao', { replace: true });
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-white text-center p-4">
      <div className="card bg-dark border-danger" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5">
          {/* Logo da Empresa */}
          <div className="mb-4">
            <h2 className="text-gold mb-0">💈 BarberTime</h2>
            <p className="text-muted">Sistema de Gestão</p>
          </div>

          {/* Status Visual */}
          <div className="mb-4">
            <div className="text-danger">
              <div className="display-1">🚫</div>
              <h3>Acesso Negado</h3>
            </div>
          </div>

          {/* Informações do Usuário */}
          {user && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className="text-white fs-4">
                    {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-start">
                  <h5 className="mb-1">{user.user_metadata?.full_name || 'Usuário'}</h5>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de Negação */}
          <div className="mb-4">
            <div className="alert alert-danger">
              <h5 className="alert-heading">❌ Acesso Negado</h5>
              <p className="mb-0">
                Sua solicitação de acesso ao painel administrativo foi negada.
              </p>
            </div>
            
            <p className="text-muted">
              Entre em contato com o administrador para mais informações sobre 
              o motivo da negação ou para solicitar uma nova avaliação.
            </p>
          </div>

          {/* Informações de Contato */}
          <div className="mb-4">
            <div className="card bg-secondary">
              <div className="card-body">
                <h6 className="card-title">📞 Contato do Administrador</h6>
                <p className="card-text small mb-0">
                  <strong>Email:</strong> guilhermesf.beasss@gmail.com<br />
                  <strong>Assunto:</strong> Solicitação de Acesso - BarberTime
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="d-grid gap-2">
            <button 
              className="btn btn-outline-warning"
              onClick={handleTryAgain}
            >
              🔄 Verificar Status Novamente
            </button>
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

export default AcessoNegado;
