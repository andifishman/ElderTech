import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  fullName: string;
  username: string;
  email: string;
  floor?: string;
  difficulty: 'Independiente' | 'Necesita ayuda' | 'Dependiente';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (data: User & { password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users store
const mockUsers: Array<User & { password: string }> = [
  {
    fullName: 'Marta García',
    username: 'marta',
    email: 'marta@gmail.com',
    password: '1234',
    floor: '3A',
    difficulty: 'Independiente',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const register = (data: User & { password: string }) => {
    mockUsers.push(data);
    const { password: _, ...userData } = data;
    setUser(userData);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
