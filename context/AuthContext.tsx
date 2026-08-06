'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number | string;
  username: string;
  role: 'admin' | 'pelanggan' | string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: { token: string; user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('bumdes_token') || localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('bumdes_user') || localStorage.getItem('user');

      if (storedToken && storedUserRaw) {
        const parsedUser = JSON.parse(storedUserRaw);
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'bumdes_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading auth state from localStorage:', error);
      document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'bumdes_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = ({ token: newToken, user: newUser }: { token: string; user: User }) => {
    localStorage.setItem('bumdes_token', newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('bumdes_user', JSON.stringify(newUser));
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('bumdes_logged_in', 'true');
    document.cookie = 'bumdes_logged_in=true; path=/; max-age=86400';
    if (newUser?.role) {
      document.cookie = `bumdes_role=${newUser.role}; path=/; max-age=86400`;
    }

    setToken(newToken);
    setUser(newUser);

    if (newUser?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (newUser?.role === 'pelanggan') {
      router.push('/pelanggan/dashboard');
    } else {
      router.push('/login');
    }
  };

  const logout = () => {
    localStorage.removeItem('bumdes_token');
    localStorage.removeItem('token');
    localStorage.removeItem('bumdes_user');
    localStorage.removeItem('user');
    localStorage.removeItem('bumdes_logged_in');
    document.cookie = 'bumdes_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'bumdes_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    setToken(null);
    setUser(null);

    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
