export type Gender = 'male' | 'female' | 'non-binary';

export type UserRole = 'player' | 'admin';

export interface BaseUser {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  email: string;
  gender: Gender;
  birthday: string; // YYYY-MM-DD
  role: UserRole;
  createdAt: string;
  bio?: string;
  favoriteType?: string;
  favoriteRegion?: string;
  leadPartnerId?: number;
}

export interface PlayerUser extends BaseUser {
  role: 'player';
  unlockedPokemonIds: number[];
  stats: {
    totalGuesses: number;
    correctGuesses: number;
    arenaWins: number;
  };
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  department: string;
}

export type AppUser = PlayerUser | AdminUser;

// Helper to determine gender icon styling as requested in spec:
// blue person for male; pink person for female; gray person for non-binary
export const GENDER_ICON_COLORS: Record<Gender, { bg: string; text: string; label: string }> = {
  male: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Male' },
  female: { bg: 'bg-pink-100', text: 'text-pink-600', label: 'Female' },
  'non-binary': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Non-binary' },
};
