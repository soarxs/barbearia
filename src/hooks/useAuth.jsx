import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

// Utility functions
const isMainAdmin = (email) => email === 'guilhermesf.beasss@gmail.com' || email === 'guilhermesf.beass@icloud.com';

const logAccessAttempt = async (email, method, status, error = null, userName = null) => {
  try {
    await supabase.from('access_logs').insert([{
      email,
      method,
      status,
      error_message: error,
      user_name: userName,
      ip_address: null,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('Erro ao logar tentativa de acesso:', err);
  }
};

const isUserApproved = async (userEmail) => {
  if (isMainAdmin(userEmail)) return true;
  
  try {
    const { data, error } = await supabase
      .from('approved_users')
      .select('is_approved')
      .eq('email', userEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar aprovação:', error);
      return false;
    }
    return data?.is_approved || false;
  } catch (error) {
    console.error('Erro ao verificar aprovação:', error);
    return false;
  }
};

const getUserApprovalStatus = async (userEmail) => {
  try {
    const { data, error } = await supabase
      .from('approved_users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar status de aprovação:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
          console.log('Token OAuth processado com sucesso');
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session) {
          if (session.user.app_metadata.provider === 'google') {
            await handleGoogleCallback();
          }
          
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

    const handleBeforeUnload = () => supabase.auth.signOut();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleGoogleCallback = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const userEmail = session.user.email;
        const isApproved = await isUserApproved(userEmail);
        
        if (!isApproved) {
          const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail;
          await logAccessAttempt(userEmail, 'google_oauth', 'unauthorized', 'Usuário não aprovado', userName);
          await supabase.auth.signOut();
          toast.error('Acesso não autorizado. Aguarde aprovação do administrador.');
          return { success: false, error: 'USER_NOT_APPROVED', email: userEmail, userName };
        }
        
        await logAccessAttempt(userEmail, 'google_oauth', 'success', null, session.user.user_metadata?.full_name || userEmail);
        return { success: true, user: session.user };
      }
    } catch (error) {
      console.error('Erro no callback do Google:', error);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        await logAccessAttempt(email, 'email_password', 'blocked', error.message);
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.');
        } else {
          throw error;
        }
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          await logAccessAttempt(email, 'email_password', 'blocked', 'Email não confirmado');
          throw new Error('EMAIL_NOT_CONFIRMED');
        }

        const isApproved = await isUserApproved(data.user.email);
        if (!isApproved) {
          await logAccessAttempt(email, 'email_password', 'unauthorized', 'Usuário não aprovado', data.user.user_metadata?.full_name || email);
          throw new Error('USER_NOT_APPROVED');
        }

        await logAccessAttempt(email, 'email_password', 'success', null, data.user.user_metadata?.full_name || email);

        if (rememberMe) {
          const authData = {
            rememberMe: true,
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
            userEmail: data.user.email,
          };
          localStorage.setItem('bt_admin_auth', JSON.stringify(authData));
        }

        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('bt_admin_auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL || 'https://barbearia-guilhermes-projects-02fc08b4.vercel.app'}/admin/agenda`,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast.error('Erro ao fazer login com Google');
    }
  };

  const resendConfirmation = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      if (error) throw error;
      toast.success('Email de confirmação reenviado');
    } catch (error) {
      console.error('Erro ao reenviar confirmação:', error);
      toast.error('Erro ao reenviar email de confirmação');
    }
  };

  const isAdmin = (user) => {
    if (!user?.email) return false;
    return isMainAdmin(user.email) || user.user_metadata?.role === 'admin';
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
