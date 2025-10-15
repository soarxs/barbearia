import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Contexto de autenticação
const AuthContext = createContext({});

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const getSession = async () => {
      try {
        // Primeiro, verificar se há um token na URL (callback do OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Processar o token OAuth
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Erro ao processar token OAuth:', error);
          } else {
            console.log('Token OAuth processado com sucesso');
            setSession(data.session);
            setUser(data.user);
            setLoading(false);
            return;
          }
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao obter sessão:', error);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Verificar se há dados salvos no localStorage (para "lembrar de mim")
        const savedAuth = localStorage.getItem('bt_admin_auth');
        if (savedAuth && !session) {
          try {
            const authData = JSON.parse(savedAuth);
            if (authData.rememberMe && authData.expiresAt > Date.now()) {
              // Tentar renovar a sessão se ainda estiver válida
              const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
              if (!refreshError && refreshedUser) {
                setUser(refreshedUser);
                setSession({ user: refreshedUser });
              } else {
                // Limpar dados expirados
                localStorage.removeItem('bt_admin_auth');
              }
            } else {
              // Limpar dados expirados
              localStorage.removeItem('bt_admin_auth');
            }
          } catch (parseError) {
            console.error('Erro ao parsear dados salvos:', parseError);
            localStorage.removeItem('bt_admin_auth');
          }
        }
        
        // Se não há sessão ativa, limpar localStorage para forçar login
        if (!session) {
          localStorage.removeItem('bt_admin_auth');
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session) {
          // Handle Google OAuth callback for approval check
          if (session.user.app_metadata.provider === 'google') {
            await handleGoogleCallback();
          }
          
          // Limpar a URL após login bem-sucedido
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('URL limpa após login');
          }
        }

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('bt_admin_auth');
        }
      }
    );

    // Adicionar listener para fechar a janela/aba
    const handleBeforeUnload = () => {
      // Fazer logout quando a página for fechada
      supabase.auth.signOut();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

      // Função para logar tentativa de acesso
      const logAccessAttempt = async (email, attemptType, status, reason = null, userName = null) => {
        try {
          const { error } = await supabase.rpc('log_access_attempt', {
            p_email: email,
            p_ip_address: null, // Será obtido pelo servidor
            p_user_agent: navigator.userAgent,
            p_attempt_type: attemptType,
            p_status: status,
            p_reason: reason,
            p_user_name: userName
          });

          if (error) {
            console.error('Erro ao logar tentativa de acesso:', error);
          }
        } catch (error) {
          console.error('Erro ao logar tentativa de acesso:', error);
        }
      };

  // Função de login
  const signIn = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Logar tentativa falhada
        await logAccessAttempt(email, 'email_password', 'blocked', error.message);
        
        // Tratar erros específicos
        if (error.message.includes('Email not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.');
        } else {
          throw error;
        }
      }

      if (data.user) {
        // Verificar se o email está confirmado
        if (!data.user.email_confirmed_at) {
          await logAccessAttempt(email, 'email_password', 'blocked', 'Email não confirmado');
          throw new Error('EMAIL_NOT_CONFIRMED');
        }

        // Verificar se o usuário está aprovado
        const isApproved = await isUserApproved(data.user.email);
        if (!isApproved) {
          await logAccessAttempt(email, 'email_password', 'unauthorized', 'Usuário não aprovado', data.user.user_metadata?.full_name || email);
          throw new Error('USER_NOT_APPROVED');
        }

        // Logar tentativa bem-sucedida
        await logAccessAttempt(email, 'email_password', 'success', null, data.user.user_metadata?.full_name || email);

        // Salvar dados de autenticação se "lembrar de mim" estiver marcado
        if (rememberMe) {
          const authData = {
            rememberMe: true,
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 dias
            userEmail: data.user.email,
          };
          localStorage.setItem('bt_admin_auth', JSON.stringify(authData));
        }

        toast.success('Login realizado com sucesso!');
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        return { success: false, error: 'EMAIL_NOT_CONFIRMED', email };
      }
      if (error.message === 'USER_NOT_APPROVED') {
        return { success: false, error: 'USER_NOT_APPROVED', email };
      }
      toast.error(error.message || 'Erro ao fazer login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função para reenviar email de confirmação
  const resendConfirmation = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.');
      return { success: true };
    } catch (error) {
      console.error('Erro ao reenviar confirmação:', error);
      toast.error(error.message || 'Erro ao reenviar email de confirmação');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função para login com Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL || 'https://barbearia-ruby-one.vercel.app'}/admin/agenda`,
        }
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast.error(error.message || 'Erro ao fazer login com Google');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar e logar login com Google após redirecionamento
  const handleGoogleCallback = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        return;
      }

      if (session?.user) {
        const userEmail = session.user.email;
        
        // Verificar se o usuário está aprovado
        const isApproved = await isUserApproved(userEmail);
        
        if (!isApproved) {
            // Obter nome do usuário do Google
            const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail;

            // Logar tentativa não autorizada
            await logAccessAttempt(userEmail, 'google_oauth', 'unauthorized', 'Usuário não aprovado', userName);

            // Fazer logout
            await supabase.auth.signOut();

            // Mostrar mensagem de erro
            toast.error('Acesso não autorizado. Aguarde aprovação do administrador.');
            return { success: false, error: 'USER_NOT_APPROVED', email: userEmail, userName };
          }

          // Obter nome do usuário do Google
          const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail;

          // Logar tentativa bem-sucedida
          await logAccessAttempt(userEmail, 'google_oauth', 'success', null, userName);
        
        toast.success('Login com Google realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no callback do Google:', error);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      localStorage.removeItem('bt_admin_auth');
      setUser(null);
      setSession(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

      // Função para verificar se o usuário está aprovado
      const isUserApproved = async (userEmail) => {
        // Email principal sempre aprovado
        if (userEmail === 'guilhermesf.beasss@gmail.com') {
          return true;
        }
        
        try {
          const { data, error } = await supabase
            .from('approved_users')
            .select('is_approved')
            .eq('email', userEmail)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Erro ao verificar aprovação:', error);
            return false;
          }

          return data?.is_approved || false;
        } catch (error) {
          console.error('Erro ao verificar aprovação:', error);
          return false;
        }
      };

      // Função para verificar status de aprovação (retorna mais informações)
      const getUserApprovalStatus = async (userEmail) => {
        // Email principal sempre aprovado
        if (userEmail === 'guilhermesf.beasss@gmail.com') {
          return { isApproved: true, status: 'approved' };
        }
        
        try {
          const { data, error } = await supabase
            .from('approved_users')
            .select('is_approved')
            .eq('email', userEmail)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Erro ao verificar aprovação:', error);
            return { isApproved: false, status: 'error' };
          }

          if (data) {
            return { 
              isApproved: data.is_approved, 
              status: data.is_approved ? 'approved' : 'pending' 
            };
          } else {
            return { isApproved: false, status: 'pending' };
          }
        } catch (error) {
          console.error('Erro ao verificar aprovação:', error);
          return { isApproved: false, status: 'error' };
        }
      };

  // Função para verificar se o usuário é admin
  const isAdmin = () => {
    return user && user.email && (
      user.email === 'guilhermesf.beasss@gmail.com' || 
      user.email === 'guilhermesf.beass@icloud.com' ||
      user.email.endsWith('@admin.barbearia.com')
    );
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
    resendConfirmation,
    signInWithGoogle,
    isUserApproved,
    getUserApprovalStatus,
    logAccessAttempt,
    handleGoogleCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
