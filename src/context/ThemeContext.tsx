import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  /** The theme active for the current surface. */
  theme: ThemeMode;
  /** Trainer Vault preference. It is deliberately separate from public-site and admin themes. */
  setTheme: (theme: ThemeMode) => void;
  publicTheme: ThemeMode;
  togglePublicTheme: () => void;
  adminTheme: ThemeMode;
  setAdminTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const TRAINER_THEME_STORAGE_KEY = 'pokellects-trainer-theme';
const PUBLIC_THEME_STORAGE_KEY = 'pokellects-public-theme';
const ADMIN_THEME_STORAGE_KEY = 'pokellects-admin-theme';

const readSavedTheme = (key: string): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(key);
  return saved === 'dark' || saved === 'light' ? saved : null;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [trainerTheme, setTrainerTheme] = useState<ThemeMode>(() => readSavedTheme(TRAINER_THEME_STORAGE_KEY) ?? 'light');
  const [publicTheme, setPublicTheme] = useState<ThemeMode>(() => readSavedTheme(PUBLIC_THEME_STORAGE_KEY) ?? 'light');
  const [adminTheme, setAdminThemeState] = useState<ThemeMode>(() => readSavedTheme(ADMIN_THEME_STORAGE_KEY) ?? 'light');

  // Public pages, Trainer Vault, and Admin Console intentionally retain separate themes.
  // While Convex restores a session, retain the last Trainer Vault theme instead
  // of briefly painting the landing page with the public default before profile
  // data arrives. Once resolved, each surface uses its own saved preference.
  const theme = isLoading ? trainerTheme : !currentUser ? publicTheme : isAdmin ? adminTheme : trainerTheme;

  const setTheme = (newTheme: ThemeMode) => {
    setTrainerTheme(newTheme);
    window.localStorage.setItem(TRAINER_THEME_STORAGE_KEY, newTheme);
  };

  const togglePublicTheme = () => {
    setPublicTheme((currentTheme) => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, newTheme);
      return newTheme;
    });
  };

  const setAdminTheme = (newTheme: ThemeMode) => {
    setAdminThemeState(newTheme);
    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, newTheme);
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
    <ThemeContext.Provider value={{ theme, setTheme, publicTheme, togglePublicTheme, adminTheme, setAdminTheme, isDark: theme === 'dark' }}>
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
