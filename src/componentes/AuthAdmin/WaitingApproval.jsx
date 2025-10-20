import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth.jsx';

function WaitingApproval() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [checking, setChecking] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário');
      setUserEmail(user.email);
      setChecking(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  if (checking) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-white mt-3">Verificando status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card bg-dark border-warning">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full d-flex align-items-center justify-content-center shadow-lg">
                    <span className="text-white fs-4 fw-bold">💈</span>
                  </div>
                  <h2 className="text-blue mb-0">BarberTime</h2>
                </div>
                <span className="display-1">⏳</span>
              </div>
              
              <h2 className="text-warning mb-4">
                Aguardando Aprovação
              </h2>
              
              <div className="alert alert-info mb-4">
                <h5 className="alert-heading">
                  <span role="img" aria-label="info">ℹ️</span> Olá, {userName}!
                </h5>
                <p className="mb-2">
                  <strong>Email:</strong> {userEmail}
                </p>
                <p className="mb-0">
                  Seu acesso está sendo analisado pelo administrador. 
                  Você receberá uma notificação assim que for aprovado.
                </p>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border text-warning me-3" role="status">
                    <span className="visually-hidden">Aguardando...</span>
                  </div>
                  <span className="text-white">Verificando aprovação automaticamente...</span>
                </div>
              </div>

              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  <span role="img" aria-label="info">📋</span> O que acontece agora?
                </h6>
                <ul className="mb-0 text-start">
                  <li>O administrador foi notificado sobre sua solicitação</li>
                  <li>Você aparecerá na lista de usuários pendentes</li>
                  <li>Assim que aprovado, você terá acesso completo</li>
                  <li>Esta página será atualizada automaticamente</li>
                </ul>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-warning"
                  onClick={() => window.location.reload()}
                >
                  🔄 Atualizar Status
                </button>
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  🚪 Fazer Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingApproval;
