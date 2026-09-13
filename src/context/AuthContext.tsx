import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, PlayerUser, AdminUser } from '../types/user';
import storageService from '../services/storageService';
import { DEMO_CREDENTIALS } from '../services/mockdata';

interface AuthContextType {
  currentUser: AppUser | null;
  isPlayer: boolean;
  isAdmin: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<AppUser>) => void;
  availableUsers: AppUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => storageService.getActiveUser());
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>(() => storageService.getUsers());

  useEffect(() => {
    const user = storageService.getActiveUser();
    setCurrentUser(user);
    setAvailableUsers(storageService.getUsers());
  }, []);

  const login = (username: string, _password?: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const found = availableUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    if (found) {
      storageService.setActiveUserId(found.id);
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    // For demo purposes, we can switch to demo player or null
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      storageService.setActiveUserId(user.id);
      setCurrentUser(user);
    }
  };

  const updateCurrentUserProfile = (data: Partial<AppUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data } as AppUser;
    storageService.updateUser(updated);
    setCurrentUser(updated);
    setAvailableUsers(storageService.getUsers());
  };

  const isPlayer = currentUser?.role === 'player';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isPlayer,
        isAdmin,
        login,
        logout,
        switchUser,
        updateCurrentUserProfile,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
