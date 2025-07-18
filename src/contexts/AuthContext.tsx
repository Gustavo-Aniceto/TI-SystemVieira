import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface User {
  id: number;
  nome: string;
  nome_usuario: string;
  email: string;
  funcao: 'usuario' | 'administrador' | 'supervisor' | 'estagiario';
  empresa_id?: number;
  setor_id?: number;
  criado_em: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isIntern: boolean;
  isSupervisor: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAdmin: false,
  isIntern: false,
  isSupervisor: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isIntern, setIsIntern] = useState<boolean>(false);
  const [isSupervisor, setIsSupervisor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.funcao === 'administrador');
        setIsIntern(parsedUser.funcao === 'estagiario');
        setIsSupervisor(parsedUser.funcao === 'supervisor');
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Buscar usuário no Supabase
      const users = await supabase.getUserByCredentials(username, password);
      
      if (users && users.length > 0) {
        const foundUser = users[0];
        
        setUser(foundUser);
        setIsAdmin(foundUser.funcao === 'administrador');
        setIsIntern(foundUser.funcao === 'estagiario');
        setIsSupervisor(foundUser.funcao === 'supervisor');
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login. Verifique sua conexão.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsIntern(false);
    setIsSupervisor(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isIntern, 
      isSupervisor, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};