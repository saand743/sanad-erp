'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback((module, action) => {
    if (!user || !user.permissions) return false;
    // Example permission structure: { "settings": ["create", "read", "update", "delete"] }
    const modulePermissions = user.permissions[module];
    if (!modulePermissions) return false;
    return modulePermissions.includes(action);
  }, [user]);

  const value = { user, isAuthenticated: !!user, loading, logout, hasPermission };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};