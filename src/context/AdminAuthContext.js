'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setIsAuthenticated(localStorage.getItem('ecommercewale_admin_auth') === 'true');
      } catch (error) {
        console.error('Failed to read auth state from local storage:', error);
      }
      setIsLoading(false);
    });
  }, []);

  const login = (email, password) => {
    // Mock credentials for demonstration
    if (email === 'admin@ecommercewale.in' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('ecommercewale_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ecommercewale_admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
