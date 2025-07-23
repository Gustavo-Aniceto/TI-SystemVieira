import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isIntern: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Criar usuário admin padrão se não existir
  const createDefaultAdmin = async () => {
    try {
      const { data: existingAdmin } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome_usuario', 'AdminMaster')
        .single();

      if (!existingAdmin) {
        // Primeiro, criar uma empresa padrão se não existir
        const { data: empresa } = await supabase
          .from('empresas')
          .select('*')
          .eq('nome', 'Empresa Principal')
          .single();

        let empresaId = empresa?.id;

        if (!empresa) {
          const { data: novaEmpresa } = await supabase
            .from('empresas')
            .insert([{
              nome: 'Empresa Principal',
              descricao: 'Empresa principal do sistema'
            }])
            .select()
            .single();
          
          empresaId = novaEmpresa?.id;
        }

        // Criar usuário admin padrão
        await supabase
          .from('usuarios')
          .insert([{
            nome: 'Administrador Master',
            nome_usuario: 'AdminMaster',
            email: 'admin@sistema.com',
            senha: '@dminM@ster',
            funcao: 'administrador',
            empresa_id: empresaId
          }]);
      }
    } catch (error) {
      console.error('Erro ao criar usuário admin padrão:', error);
    }
  };

  // Verificar sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        await createDefaultAdmin();
        
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Verificar se o usuário ainda existe no banco
          const { data: dbUser } = await supabase
            .from('usuarios')
            .select(`
              *,
              empresas(nome),
              setores(nome)
            `)
            .eq('id', userData.id)
            .single();

          if (dbUser) {
            setUser(dbUser);
          } else {
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: user, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresas(nome),
          setores(nome)
        `)
        .eq('nome_usuario', username)
        .eq('senha', password)
        .single();

      if (error || !user) {
        return false;
      }

      setUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const isAdmin = user?.funcao === 'administrador';
  const isSupervisor = user?.funcao === 'supervisor';
  const isIntern = user?.funcao === 'estagiario';

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin,
    isSupervisor,
    isIntern
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};