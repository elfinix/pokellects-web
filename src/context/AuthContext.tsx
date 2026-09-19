import React, { createContext, useContext, useMemo } from 'react';
import { useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AppUser } from '../types/user';
import storageService from '../services/storageService';

interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  isPlayer: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  switchUser: (_userId: string) => void;
  updateCurrentUserProfile: (_data: Partial<AppUser>) => void;
  availableUsers: AppUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.current, isAuthenticated ? {} : 'skip');
  const availableUsers = useMemo(() => storageService.getUsers(), []);
  const currentUser = useMemo<AppUser | null>(() => {
    if (!profile || !profile.email || !profile.username || !profile.firstName || !profile.role) return null;
    const base = { id: profile._id, username: profile.username, email: profile.email, firstName: profile.firstName, lastName: profile.lastName, gender: 'non-binary' as const, birthday: profile.birthday ?? '', role: profile.role, createdAt: new Date(profile.createdAt ?? profile._creationTime).toISOString() };
    if (profile.role === 'admin') return { ...base, role: 'admin', department: profile.department ?? 'Administration' };
    return { ...base, role: 'player', unlockedPokemonIds: [], stats: { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 } };
  }, [profile]);
  const value = useMemo<AuthContextType>(() => ({ currentUser, isLoading: isLoading || (isAuthenticated && profile === undefined), isPlayer: currentUser?.role === 'player', isAdmin: currentUser?.role === 'admin', logout: signOut, switchUser: () => {}, updateCurrentUserProfile: () => {}, availableUsers }), [availableUsers, currentUser, isAuthenticated, isLoading, profile, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; }
export default AuthProvider;
