import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function VerificationCode({ userEmail, userName, onVerificationSuccess, onBack }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // Timer de 30 minutos
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error('Código deve ter 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_and_use_code', {
        p_code: code
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success('Código verificado com sucesso! Acesso liberado.');
        onVerificationSuccess(data);
      } else {
        toast.error(data.error || 'Código inválido');
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error('Erro ao verificar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_verification_code', {
        p_email: userEmail,
        p_user_name: userName
      });

      if (error) {
        throw error;
      }

      toast.success('Novo código gerado! Verifique seu email.');
      setTimeLeft(30 * 60); // Reset timer
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      toast.error('Erro ao gerar novo código. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card bg-dark border-warning">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="text-warning mb-3">
                  <span role="img" aria-label="lock">🔐</span> Verificação de Acesso
                </h3>
                <p className="text-muted">
                  Um código de verificação foi enviado para o administrador.
                </p>
              </div>

              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <span role="img" aria-label="info">ℹ️</span> Informações do Usuário:
                </h6>
                <p className="mb-1"><strong>Nome:</strong> {userName}</p>
                <p className="mb-0"><strong>Email:</strong> {userEmail}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="code" className="form-label text-white">
                    Código de Verificação (6 dígitos)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                    disabled={loading || timeLeft === 0}
                  />
                </div>

                {timeLeft > 0 && (
                  <div className="text-center mb-3">
                    <small className="text-muted">
                      Código expira em: <span className="text-warning">{formatTime(timeLeft)}</span>
                    </small>
                  </div>
                )}

                {timeLeft === 0 && (
                  <div className="alert alert-warning text-center">
                    <small>Código expirado. Solicite um novo código.</small>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning btn-lg"
                    disabled={loading || code.length !== 6 || timeLeft === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verificando...
                      </>
                    ) : (
                      'Verificar Código'
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Gerando...
                      </>
                    ) : (
                      'Solicitar Novo Código'
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={onBack}
                  >
                    Voltar ao Login
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <div className="alert alert-light">
                  <h6 className="alert-heading">
                    <span role="img" aria-label="info">📋</span> Como funciona:
                  </h6>
                  <ol className="mb-0 small">
                    <li>Você tentou fazer login pela primeira vez</li>
                    <li>Um código foi gerado e enviado para o administrador</li>
                    <li>O administrador deve aprovar seu acesso</li>
                    <li>Após aprovação, você receberá o código</li>
                    <li>Digite o código para liberar seu acesso</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationCode;
