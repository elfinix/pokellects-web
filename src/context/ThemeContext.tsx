import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  /** The currently active theme ('light' | 'dark'). */
  theme: ThemeMode;
  /** Set active theme directly. */
  setTheme: (theme: ThemeMode) => void;
  /** Toggle between light and dark modes. */
  toggleTheme: () => void;
  /** Public site theme alias for compatibility. */
  publicTheme: ThemeMode;
  /** Toggle public theme alias. */
  togglePublicTheme: () => void;
  /** Admin theme alias for compatibility. */
  adminTheme: ThemeMode;
  /** Set admin theme alias. */
  setAdminTheme: (theme: ThemeMode) => void;
  /** Boolean helper indicating if dark mode is active. */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'pokellects-theme';

const readSavedTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved =
    window.localStorage.getItem(THEME_STORAGE_KEY) ||
    window.localStorage.getItem('pokellects-trainer-theme') ||
    window.localStorage.getItem('pokellects-public-theme') ||
    window.localStorage.getItem('pokellects-admin-theme');
  return saved === 'dark' || saved === 'light' ? saved : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => readSavedTheme());

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      window.localStorage.setItem('pokellects-trainer-theme', newTheme);
      window.localStorage.setItem('pokellects-public-theme', newTheme);
      window.localStorage.setItem('pokellects-admin-theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const togglePublicTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const setAdminTheme = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme);
  }, [setTheme]);

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
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        publicTheme: theme,
        togglePublicTheme,
        adminTheme: theme,
        setAdminTheme,
        isDark: theme === 'dark',
      }}
    >
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

