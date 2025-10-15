import React, { useState } from 'react';
import { toast } from 'sonner';
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import EmailVerification from './EmailVerification.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email.trim() || !password.trim()) {
      setError('Informe email e senha.');
      setIsLoading(false);
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido.');
      setIsLoading(false);
      return;
    }

        try {
          const result = await signIn(email.trim(), password, rememberMe);

          if (result.success) {
            const redirectTo = location.state?.from?.pathname || '/admin/agenda';
            navigate(redirectTo, { replace: true });
          } else if (result.error === 'EMAIL_NOT_CONFIRMED') {
            setPendingEmail(email.trim());
            setShowEmailVerification(true);
          } else if (result.error === 'USER_NOT_APPROVED') {
            setError('Acesso não autorizado. Entre em contato com o administrador.');
          } else {
            setError(result.error || 'Erro ao fazer login');
          }
        } catch (err) {
          setError('Erro inesperado. Tente novamente.');
          console.error('Erro no login:', err);
        } finally {
          setIsLoading(false);
        }
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setPendingEmail('');
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // O redirecionamento será feito automaticamente pelo Supabase
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
    }
  };

  // Se deve mostrar verificação de email
  if (showEmailVerification) {
    return (
      <EmailVerification 
        email={pendingEmail} 
        onBack={handleBackToLogin} 
      />
    );
  }


  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-card p-4 p-md-5">
        <div className="text-center mb-3">
          <div className="d-inline-flex align-items-center gap-2 fs-4 fw-semibold gradient-text"><span role="img" aria-label="barber">💈</span>BarberTime Admin</div>
          <div className="text-muted-light small">Acesse para gerenciar agenda, serviços e faturamento</div>
        </div>
        <form onSubmit={onSubmit} className="animate-fade-in">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email"
              className="form-control bg-dark text-white border-secondary" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@barbearia.com" 
              disabled={isLoading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <div className="input-group">
              <input 
                type={show ? 'text' : 'password'} 
                className="form-control bg-dark text-white border-secondary" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••" 
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="btn btn-outline-gold" 
                onClick={() => setShow(s => !s)}
                disabled={isLoading}
              >
                {show ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <div className="mb-3 form-check">
            <input 
              type="checkbox" 
              className="form-check-input" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label className="form-check-label text-white" htmlFor="rememberMe">
              Lembrar de mim
            </label>
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button 
            type="submit" 
            className="btn btn-gold w-100" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
          
          <div className="text-center my-3">
            <span className="text-muted-light">ou</span>
          </div>
          
          <button 
            type="button" 
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>
          
        </form>
      </div>
    </div>
  );
}

export default Login;

