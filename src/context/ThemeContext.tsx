import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import storageService from '../services/storageService';
import { useDatabaseVersion } from '../hooks/useDatabaseVersion';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const databaseVersion = useDatabaseVersion();
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    if (!currentUser) return;
    setThemeState(storageService.getUserSettings(currentUser.id).theme);
  }, [currentUser?.id, databaseVersion]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (currentUser) storageService.updateUserSettings(currentUser.id, { theme: newTheme });
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
