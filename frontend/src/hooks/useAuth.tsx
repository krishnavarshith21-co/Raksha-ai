import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

/* Safe browser storage utilities that never throw exceptions */
function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`[RAKSHYA STORAGE WARNING]: Could not read "${key}"`, err);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[RAKSHYA STORAGE WARNING]: Could not set "${key}"`, err);
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[RAKSHYA STORAGE WARNING]: Could not remove "${key}"`, err);
  }
}

function getInitialUser(): User | null {
  const stored = safeGetItem('rakshya_user');
  if (!stored || stored === 'undefined' || stored === 'null') return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && typeof parsed.email === 'string') {
      return parsed;
    }
    safeRemoveItem('rakshya_user');
    return null;
  } catch {
    safeRemoveItem('rakshya_user');
    return null;
  }
}

function getInitialToken(): string | null {
  const stored = safeGetItem('rakshya_token');
  if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
    return null;
  }
  return stored;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  retryAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; organizationName: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAnalyst: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  // Non-blocking: if no token exists, loading is immediately false
  const [loading, setLoading] = useState<boolean>(() => !!getInitialToken());
  const [authError, setAuthError] = useState<string | null>(null);

  const validateSession = useCallback(async () => {
    const currentToken = getInitialToken();
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      setAuthError(null);
      const res = await authApi.me();
      const userData = res.data?.data || res.data?.user || res.data;

      // Validate payload shape to prevent HTML fallback strings from corrupting user state
      if (userData && typeof userData === 'object' && typeof userData.email === 'string') {
        setUser(userData);
        safeSetItem('rakshya_user', JSON.stringify(userData));
      } else {
        // Unexpected shape, clear stale session
        setUser(null);
        setToken(null);
        safeRemoveItem('rakshya_token');
        safeRemoveItem('rakshya_user');
      }
    } catch (err: any) {
      // If 401 or network rejection, clear stale credentials
      console.warn('[RAKSHYA AUTH]: Stale or invalid session encountered during initialization');
      setUser(null);
      setToken(null);
      safeRemoveItem('rakshya_token');
      safeRemoveItem('rakshya_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      validateSession();
    } else {
      setLoading(false);
    }
  }, [token, validateSession]);

  const retryAuth = useCallback(() => {
    setLoading(true);
    setAuthError(null);
    validateSession();
  }, [validateSession]);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    const res = await authApi.login(email, password);
    const { token: newToken, user: userData } = res.data;

    if (!newToken || !userData) {
      throw new Error('Invalid response structure received from authentication gateway');
    }

    setToken(newToken);
    setUser(userData);
    safeSetItem('rakshya_token', newToken);
    safeSetItem('rakshya_user', JSON.stringify(userData));
  };

  const register = async (data: { email: string; password: string; name: string; organizationName: string }) => {
    setAuthError(null);
    const res = await authApi.register(data);
    const { token: newToken, user: userData } = res.data;

    if (!newToken || !userData) {
      throw new Error('Invalid response structure received from registration gateway');
    }

    setToken(newToken);
    setUser(userData);
    safeSetItem('rakshya_token', newToken);
    safeSetItem('rakshya_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    safeRemoveItem('rakshya_token');
    safeRemoveItem('rakshya_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        authError,
        retryAuth,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider hierarchy');
  }
  return context;
}
