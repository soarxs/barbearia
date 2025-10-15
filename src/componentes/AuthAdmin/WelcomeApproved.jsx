import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';

function WelcomeApproved() {
  const [userName, setUserName] = useState('');
  const [countdown, setCountdown] = useState(5);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário');
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/admin/agenda');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoNow = () => {
    navigate('/admin/agenda');
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card bg-dark border-success">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <span className="display-1">🎉</span>
              </div>
              
              <h2 className="text-success mb-4">
                Bem-vindo, {userName}!
              </h2>
              
              <div className="alert alert-success mb-4">
                <h5 className="alert-heading">
                  <span role="img" aria-label="success">✅</span> Acesso Aprovado!
                </h5>
                <p className="mb-0">
                  Seu acesso ao sistema foi aprovado com sucesso. 
                  Agora você pode usar todas as funcionalidades administrativas.
                </p>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center">
                  <span className="text-white me-3">Redirecionando em:</span>
                  <span className="badge bg-success fs-4">{countdown}s</span>
                </div>
              </div>

              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <span role="img" aria-label="info">🚀</span> Próximos passos:
                </h6>
                <ul className="mb-0 text-start">
                  <li>Você será redirecionado para a agenda</li>
                  <li>Explore o painel administrativo</li>
                  <li>Configure os serviços da barbearia</li>
                  <li>Gerencie agendamentos e clientes</li>
                </ul>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleGoNow}
                >
                  🚀 Ir para o Sistema Agora
                </button>
                <button
                  className="btn btn-outline-light"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  📊 Ver Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeApproved;
