'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/session', { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setIsAuthenticated(data.authenticated === true))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to sign in');
    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    const response = await fetch('/api/admin/session', { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to sign out');
    setIsAuthenticated(false);
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
