import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isIntern: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAdmin: false,
  isIntern: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isIntern, setIsIntern] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
      setIsIntern(parsedUser.role === 'intern');
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check if there are any users in the system
    const usersStr = localStorage.getItem('users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // If no users, initialize with the default admin
    if (users.length === 0) {
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: 'admin',
        name: 'Administrador',
        role: 'admin',
        email: 'admin@example.com',
        createdAt: new Date().toISOString(),
      };
      
      users = [defaultAdmin];
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const foundUser = users.find(
      (u: User) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      setIsAdmin(foundUser.role === 'admin');
      setIsIntern(foundUser.role === 'intern');
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsIntern(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isIntern }}>
      {children}
    </AuthContext.Provider>
  );
};