import React, { useState } from 'react';
import { toast } from 'sonner';
import './Login.css';
import { useAuth } from '@/hooks/useAuth.jsx';

function EmailVerification({ email, onBack }) {
  const [isResending, setIsResending] = useState(false);
  const { resendConfirmation } = useAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendConfirmation(email);
      if (result.success) {
        toast.success('Email de confirmação reenviado!');
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-card p-4 p-md-5">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 fs-4 fw-semibold gradient-text">
            <span role="img" aria-label="email">📧</span>Verificação de Email
          </div>
          <div className="text-muted-light small mt-2">
            Confirme seu email para acessar a área administrativa
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="alert alert-warning py-3">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span role="img" aria-label="warning">⚠️</span>
              <strong>Email não confirmado</strong>
            </div>
            <p className="mb-0 small">
              Enviamos um link de confirmação para:
            </p>
            <strong className="text-primary">{email}</strong>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="text-white mb-3">📋 Próximos passos:</h6>
          <ol className="text-muted-light small">
            <li className="mb-2">Abra seu email</li>
            <li className="mb-2">Procure por um email do <strong>Supabase</strong></li>
            <li className="mb-2">Clique no <strong>link de confirmação</strong></li>
            <li className="mb-2">Volte aqui e faça login novamente</li>
          </ol>
        </div>

        <div className="mb-4">
          <h6 className="text-white mb-3">💡 Não encontrou o email?</h6>
          <ul className="text-muted-light small">
            <li className="mb-1">Verifique a pasta de <strong>SPAM/LIXO ELETRÔNICO</strong></li>
            <li className="mb-1">Procure por <strong>"Supabase"</strong> ou <strong>"confirmação"</strong></li>
            <li className="mb-1">Pode demorar alguns minutos para chegar</li>
          </ul>
        </div>

        <div className="d-grid gap-2">
          <button 
            type="button" 
            className="btn btn-blue"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Reenviando...
              </>
            ) : (
              <>
                <span role="img" aria-label="resend">🔄</span> Reenviar Email de Confirmação
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={onBack}
          >
            <span role="img" aria-label="back">←</span> Voltar ao Login
          </button>
        </div>

        <div className="text-center mt-4">
          <small className="text-muted-light">
            Problemas com o email? Entre em contato com o suporte.
          </small>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
