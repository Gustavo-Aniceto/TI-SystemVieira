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

  // Criar usuário admin padrão se não existir
  const createDefaultAdmin = async () => {
    try {
      // Verificar se o admin já existe
      const { data: existingAdmin } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome_usuario', 'AdminMaster')
        .single();

      if (!existingAdmin) {
        // Criar usuário admin padrão
        const { error } = await supabase
          .from('usuarios')
          .insert({
            nome: 'Administrador Master',
            nome_usuario: 'AdminMaster',
            email: 'admin@vieirastock.com',
            senha: '@dminM@ster',
            funcao: 'administrador',
            empresa_id: 1
          });

        if (error) {
          console.error('Erro ao criar admin padrão:', error);
        } else {
          console.log('Usuário admin padrão criado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/criar admin padrão:', error);
    }
  };

  // Buscar dados do usuário na tabela usuarios
  const fetchUserData = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, nome_usuario, email, funcao, empresa_id, setor_id')
        .eq('nome_usuario', username)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return {
        id: data.id.toString(),
        email: data.email,
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
        // Criar admin padrão se necessário
        await createDefaultAdmin();
        
        // Verificar se há usuário logado no localStorage
        const storedUser = localStorage.getItem('vieirastock_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificar credenciais na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome_usuario', username)
        .eq('senha', password)
        .single();

      if (error) {
        console.error('Erro no login:', error);
        toast.error('Nome de usuário ou senha incorretos');
        return false;
      }

      if (data) {
        const userData = {
          id: data.id.toString(),
          email: data.email,
          nome: data.nome,
          nome_usuario: data.nome_usuario,
          funcao: data.funcao,
          empresa_id: data.empresa_id,
          setor_id: data.setor_id,
        };
        
        setUser(userData);
        localStorage.setItem('vieirastock_user', JSON.stringify(userData));
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error('Usuário não encontrado');
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setUser(null);
      setSession(null);
      localStorage.removeItem('vieirastock_user');
      toast.success('Logout realizado com sucesso!');
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
      signOut,
      isAdmin,
      isIntern,
      isSupervisor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
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