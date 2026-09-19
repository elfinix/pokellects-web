import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'pokellects-theme';

const readSavedTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' ? saved : null;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(() => readSavedTheme() ?? 'light');

  useEffect(() => {
    if (!currentUser) return;
    const savedTheme = readSavedTheme();
    if (savedTheme) setThemeState(savedTheme);
  }, [currentUser?.id]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
