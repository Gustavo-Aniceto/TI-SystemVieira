import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthUser {
  id: string;
  email: string;
  nome: string;
  nome_usuario: string;
  funcao: 'usuario' | 'administrador' | 'supervisor' | 'estagiario';
  empresa_id: number;
  setor_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: {
    email: string;
    password: string;
    nome: string;
    nome_usuario: string;
    funcao?: 'usuario' | 'administrador' | 'supervisor' | 'estagiario';
    empresa_id: number;
    setor_id?: number;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isIntern: boolean;
  isSupervisor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  isAdmin: false,
  isIntern: false,
  isSupervisor: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário na tabela usuarios
  const fetchUserData = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return {
        id: authUser.id,
        email: authUser.email!,
        nome: data.nome,
        nome_usuario: data.nome_usuario,
        funcao: data.funcao,
        empresa_id: data.empresa_id,
        setor_id: data.setor_id,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Verificar sessão inicial
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        setSession(session);

        if (session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error(error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : 'Erro ao fazer login');
        return false;
      }

      if (data.user) {
        const userData = await fetchUserData(data.user);
        if (userData) {
          setUser(userData);
          toast.success('Login realizado com sucesso!');
          return true;
        } else {
          toast.error('Usuário não encontrado no sistema');
          await supabase.auth.signOut();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    nome: string;
    nome_usuario: string;
    funcao?: 'usuario' | 'administrador' | 'supervisor' | 'estagiario';
    empresa_id: number;
    setor_id?: number;
  }): Promise<boolean> => {
    try {
      setLoading(true);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast.error('Erro ao criar conta');
        return false;
      }

      if (authData.user) {
        // 2. Criar registro na tabela usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            nome: userData.nome,
            nome_usuario: userData.nome_usuario,
            email: userData.email,
            senha: userData.password, // Em produção, isso seria hasheado
            funcao: userData.funcao || 'usuario',
            empresa_id: userData.empresa_id,
            setor_id: userData.setor_id,
          });

        if (dbError) {
          console.error('Erro ao salvar dados do usuário:', dbError);
          // Limpar usuário do Auth se falhou ao salvar no banco
          await supabase.auth.signOut();
          toast.error('Erro ao salvar dados do usuário');
          return false;
        }

        toast.success('Conta criada com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao criar conta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast.error('Erro ao fazer logout');
      } else {
        setUser(null);
        setSession(null);
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const isAdmin = user?.funcao === 'administrador';
  const isIntern = user?.funcao === 'estagiario';
  const isSupervisor = user?.funcao === 'supervisor';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin,
      isIntern,
      isSupervisor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};