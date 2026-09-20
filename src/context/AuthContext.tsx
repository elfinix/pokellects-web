import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AppUser } from '../types/user';
import storageService from '../services/storageService';

interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPlayer: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  switchUser: (_userId: string) => void;
  updateCurrentUserProfile: (_data: Partial<AppUser>) => Promise<void>;
  availableUsers: AppUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.current, isAuthenticated ? {} : 'skip');
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const availableUsers = useMemo(() => storageService.getUsers(), []);

  const [localOverrides, setLocalOverrides] = React.useState<Partial<AppUser>>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('pokellects_active_profile_overrides');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const currentUser = useMemo<AppUser | null>(() => {
    if (!profile || !profile.email || !profile.username || !profile.firstName || !profile.role) {
      if (availableUsers.length > 0) {
        return { ...availableUsers[0], ...localOverrides } as AppUser;
      }
      return null;
    }
    const base = {
      id: profile._id,
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: 'non-binary' as const,
      birthday: profile.birthday ?? '',
      createdAt: new Date(profile.createdAt ?? profile._creationTime).toISOString(),
      bio: profile.bio,
      favoriteType: profile.favoriteType,
      favoriteRegion: profile.favoriteRegion,
      leadPartnerId: profile.leadPartnerId,
      ...localOverrides,
    };
    if (profile.role === 'admin') {
      return { ...base, role: 'admin' as const, department: profile.department ?? 'Administration' };
    }
    return {
      ...base,
      role: 'player' as const,
      unlockedPokemonIds: [],
      stats: { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 },
    };
  }, [profile, availableUsers, localOverrides]);

  const updateCurrentUserProfile = useCallback(
    async (data: Partial<AppUser>) => {
      setLocalOverrides((prev) => {
        const next = { ...prev, ...data };
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('pokellects_active_profile_overrides', JSON.stringify(next));
          } catch {}
        }
        return next;
      });

      if (isAuthenticated) {
        try {
          await updateProfileMutation({
            firstName: data.firstName,
            lastName: data.lastName,
            bio: data.bio,
            favoriteType: data.favoriteType,
            favoriteRegion: data.favoriteRegion,
            leadPartnerId: data.leadPartnerId,
          });
        } catch (err) {
          console.error('Convex updateProfile mutation error:', err);
        }
      }
      if (currentUser) {
        storageService.updateUser({ ...currentUser, ...data } as AppUser);
      }
    },
    [currentUser, isAuthenticated, updateProfileMutation]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      isLoading: isLoading || (isAuthenticated && profile === undefined),
      isAuthenticated,
      isPlayer: currentUser?.role === 'player',
      isAdmin: currentUser?.role === 'admin',
      logout: signOut,
      switchUser: () => {},
      updateCurrentUserProfile,
      availableUsers,
    }),
    [availableUsers, currentUser, isAuthenticated, isLoading, profile, signOut, updateCurrentUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
export default AuthProvider;
