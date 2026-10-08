'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      let saved;
      try { saved = localStorage.getItem('ecommercewale_theme'); } catch { /* Storage may be disabled. */ }
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('ecommercewale_theme', theme); } catch { /* Storage may be disabled. */ }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
