'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, authService } from '@/lib/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  signup: (data: { name: string; email: string; password: string; company?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    authService.getCurrentUserFromSession().then((current) => {
      if (mounted) {
        setUser(current);
        setIsLoading(false);
      }
    });

    const handleAuthChanged = () => {
      setUser(authService.getCurrentUser());
    };

    window.addEventListener('dru_auth_changed', handleAuthChanged);
    return () => {
      mounted = false;
      window.removeEventListener('dru_auth_changed', handleAuthChanged);
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    localStorage.removeItem('dru_has_logged_out');
    const result = await authService.login(email, password);
    setIsLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Failed to login' };
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    localStorage.removeItem('dru_has_logged_out');
    const result = await authService.loginWithGoogle();
    setIsLoading(false);
    if (result.user) {
      setUser(result.user);
    }
  };

  const signup = async (data: { name: string; email: string; password: string; company?: string }) => {
    setIsLoading(true);
    localStorage.removeItem('dru_has_logged_out');
    const result = await authService.signup(data);
    setIsLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Failed to signup' };
  };

  const logout = () => {
    localStorage.setItem('dru_has_logged_out', 'true');
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
