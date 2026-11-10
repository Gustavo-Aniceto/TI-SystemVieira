import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, USER_COLUMNS } from '../lib/supabase';
import type { User } from '../types';

/** Usuário autenticado (a senha nunca é carregada no cliente). */
export type AuthUser = Omit<User, 'senha'>;

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isIntern: boolean;
}

const STORAGE_KEY = 'currentUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão salva e confirma que o usuário ainda existe no banco
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const { id } = JSON.parse(saved) as { id: number };
        const { data } = await supabase
          .from('usuarios')
          .select(USER_COLUMNS)
          .eq('id', id)
          .maybeSingle();

        if (data) {
          setUser(data as AuthUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('autenticar_usuario', {
        p_nome_usuario: username.trim(),
        p_senha: password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      const found = (data as AuthUser[] | null)?.[0];
      if (!found) return false;

      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.funcao === 'administrador',
    isSupervisor: user?.funcao === 'supervisor',
    isIntern: user?.funcao === 'estagiario',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
