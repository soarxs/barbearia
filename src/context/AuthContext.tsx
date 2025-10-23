import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  approveUser: (email: string) => Promise<boolean>;
  checkApprovalStatus: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserPermissions(session.user);
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserPermissions(session.user);
        } else {
          setIsAdmin(false);
          setIsApproved(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserPermissions = async (user: User) => {
    const email = user.email;
    if (!email) return;

    // Verificar se é admin principal
    const mainAdmins = ['guilhermesf.beasss@gmail.com', 'guilhermesf.beass@icloud.com'];
    const isMainAdmin = mainAdmins.includes(email);
    setIsAdmin(isMainAdmin);

    if (isMainAdmin) {
      setIsApproved(true);
      return;
    }

    // Verificar aprovação no banco
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('is_approved')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar aprovação:', error);
        setIsApproved(false);
        return;
      }

      setIsApproved(data?.is_approved || false);
    } catch (error) {
      console.error('Erro ao verificar aprovação:', error);
      setIsApproved(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }

      if (data.user) {
        await checkUserPermissions(data.user);
        toast.success('Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      if (error) {
        toast.error('Erro ao fazer login com Google: ' + error.message);
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Erro inesperado ao fazer login com Google');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao fazer logout: ' + error.message);
        return;
      }
      
      setUser(null);
      setIsAdmin(false);
      setIsApproved(false);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro inesperado ao fazer logout');
    }
  };

  const approveUser = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('approved_users')
        .upsert({
          email,
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.email
        });

      if (error) {
        toast.error('Erro ao aprovar usuário: ' + error.message);
        return false;
      }

      toast.success('Usuário aprovado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro inesperado ao aprovar usuário');
      return false;
    }
  };

  const checkApprovalStatus = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('is_approved')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return data?.is_approved || false;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isApproved,
    signIn,
    signInWithGoogle,
    signOut,
    approveUser,
    checkApprovalStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

