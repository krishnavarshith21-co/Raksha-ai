import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; organizationName: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAnalyst: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('rakshya_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rakshya_token'));
  const [loading, setLoading] = useState(true);

  const validateSession = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      const userData = res.data.data || res.data.user || res.data;
      setUser(userData);
      localStorage.setItem('rakshya_user', JSON.stringify(userData));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('rakshya_token');
      localStorage.removeItem('rakshya_user');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('rakshya_token', newToken);
    localStorage.setItem('rakshya_user', JSON.stringify(userData));
  };

  const register = async (data: { email: string; password: string; name: string; organizationName: string }) => {
    const res = await authApi.register(data);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('rakshya_token', newToken);
    localStorage.setItem('rakshya_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rakshya_token');
    localStorage.removeItem('rakshya_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isAnalyst: user?.role === 'SECURITY_ANALYST',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
