import { AppUser, PlayerUser, AdminUser } from '../types/user';
import { UnlockedPokemonEntry } from '../types/pokemon';
import { GameConfiguration, FeatureFlags, ArenaGameType, Achievement } from '../types/game';
import {
  MOCK_PLAYERS,
  MOCK_ADMIN,
  DEFAULT_GAME_CONFIG,
  DEFAULT_FEATURE_FLAGS,
  MOCK_ACHIEVEMENTS,
} from './mockdata';

export interface ArenaSessionRecord {
  id: string;
  userId: string;
  gameType: ArenaGameType;
  pokemonId: number;
  isWon: boolean;
  attemptsUsed: number;
  timeTakenSeconds: number;
  playedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  minigamesView: 'grid' | 'row';
  soundEnabled: boolean;
  reducedMotion: boolean;
  updatedAt: string;
}

export interface AdminDisplayConfiguration {
  theme: 'light' | 'dark';
}

const DEFAULT_ADMIN_DISPLAY_CONFIG: AdminDisplayConfiguration = {
  theme: 'light',
};

const listeners = new Set<() => void>();

export function subscribeToStorage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

/**
 * Local State Repository for offline/fallback mock data.
 * The primary backend database is Convex Cloud.
 */
class StorageService {
  private users: AppUser[] = [...MOCK_PLAYERS, MOCK_ADMIN];
  private pokedexEntries: UnlockedPokemonEntry[] = [];
  private arenaSessions: ArenaSessionRecord[] = [];
  private achievements: Achievement[] = [...MOCK_ACHIEVEMENTS];
  private userSettings: Map<string, UserSettings> = new Map();
  private gameConfig: GameConfiguration = { ...DEFAULT_GAME_CONFIG };
  private featureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
  private activeUserId: string = MOCK_PLAYERS[0].id;

  public async whenReady(): Promise<void> {
    return Promise.resolve();
  }

  // --- USER OPERATIONS ---
  public getUsers(): AppUser[] {
    return this.users;
  }

  public getActiveUser(): AppUser | null {
    return this.users.find((u) => u.id === this.activeUserId) || this.users[0] || null;
  }

  public setActiveUserId(userId: string): void {
    this.activeUserId = userId;
    notifyListeners();
  }

  public updateUser(updated: AppUser): void {
    const idx = this.users.findIndex((u) => u.id === updated.id);
    if (idx >= 0) {
      this.users[idx] = updated;
    } else {
      this.users.push(updated);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`pokellects_profile_${updated.id}`, JSON.stringify(updated));
      } catch {}
    }
    notifyListeners();
  }

  public deleteUser(userId: string): void {
    this.users = this.users.filter((u) => u.id !== userId);
    this.pokedexEntries = this.pokedexEntries.filter((e) => (e as any).userId !== userId);
    this.arenaSessions = this.arenaSessions.filter((s) => s.userId !== userId);
    this.userSettings.delete(userId);
    notifyListeners();
  }

  // --- POKEDEX ENTRIES ---
  public getAllPokedexEntries(): UnlockedPokemonEntry[] {
    if (this.pokedexEntries.length > 0) return this.pokedexEntries;
    const entries: UnlockedPokemonEntry[] = [];
    MOCK_PLAYERS.forEach((p) => {
      (p.unlockedPokemonIds || []).forEach((id) => {
        entries.push({
          pokemonId: id,
          unlockedAt: p.createdAt || new Date().toISOString(),
          discoveryMethod: 'starter_grant',
        });
      });
    });
    return entries;
  }

  public getPlayerUnlockedEntries(playerId: string): UnlockedPokemonEntry[] {
    const userEntries = this.pokedexEntries.filter((e: any) => e.userId === playerId);
    if (userEntries.length === 0) {
      const mock = MOCK_PLAYERS.find((p) => p.id === playerId);
      return (mock?.unlockedPokemonIds || []).map((id) => ({
        pokemonId: id,
        unlockedAt: mock?.createdAt || new Date().toISOString(),
        discoveryMethod: 'starter_grant',
      }));
    }
    return userEntries;
  }

  public unlockPokemon(playerId: string, pokemonId: number, method: UnlockedPokemonEntry['discoveryMethod']): boolean {
    const user = this.users.find((u) => u.id === playerId);
    if (user && user.role === 'player') {
      const player = user as PlayerUser;
      if (!player.unlockedPokemonIds.includes(pokemonId)) {
        player.unlockedPokemonIds.push(pokemonId);
      }
    }

    const exists = this.pokedexEntries.some((e: any) => e.userId === playerId && e.pokemonId === pokemonId);
    if (!exists) {
      this.pokedexEntries.push({
        pokemonId,
        unlockedAt: new Date().toISOString(),
        discoveryMethod: method,
        ...({ userId: playerId } as any),
      });
      notifyListeners();
      return true;
    }
    return false;
  }

  public isPokemonUnlocked(playerId: string, pokemonId: number): boolean {
    const entries = this.getPlayerUnlockedEntries(playerId);
    return entries.some((e) => e.pokemonId === pokemonId);
  }

  // --- ARENA / MINIGAME SESSIONS ---
  public getArenaSessions(playerId?: string): ArenaSessionRecord[] {
    if (playerId) {
      return this.arenaSessions.filter((s) => s.userId === playerId);
    }
    return this.arenaSessions;
  }

  public recordArenaSession(session: Omit<ArenaSessionRecord, 'id' | 'playedAt'>): void {
    const record: ArenaSessionRecord = {
      ...session,
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playedAt: new Date().toISOString(),
    };
    this.arenaSessions.unshift(record);

    const user = this.users.find((u) => u.id === session.userId);
    if (user && user.role === 'player') {
      const player = user as PlayerUser;
      player.stats.totalGuesses = (player.stats.totalGuesses || 0) + session.attemptsUsed;
      if (session.isWon) {
        player.stats.correctGuesses = (player.stats.correctGuesses || 0) + 1;
        player.stats.arenaWins = (player.stats.arenaWins || 0) + 1;
      }
    }
    notifyListeners();
  }

  // --- CONFIGURATIONS & FEATURE FLAGS ---
  public getGameConfig(): GameConfiguration {
    return this.gameConfig;
  }

  public updateGameConfig(config: Partial<GameConfiguration>): void {
    this.gameConfig = { ...this.gameConfig, ...config };
    notifyListeners();
  }

  public getFeatureFlags(): FeatureFlags {
    return this.featureFlags;
  }

  public updateFeatureFlags(flags: Partial<FeatureFlags>): void {
    this.featureFlags = { ...this.featureFlags, ...flags };
    notifyListeners();
  }

  public getAdminDisplayConfig(): AdminDisplayConfiguration {
    return DEFAULT_ADMIN_DISPLAY_CONFIG;
  }

  public updateAdminDisplayConfig(_config: Partial<AdminDisplayConfiguration>): void {
    notifyListeners();
  }

  // --- USER SETTINGS ---
  public getUserSettings(userId: string): UserSettings {
    return (
      this.userSettings.get(userId) || {
        userId,
        theme: 'light',
        minigamesView: 'grid',
        soundEnabled: true,
        reducedMotion: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  public updateUserSettings(userId: string, partial: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings(userId);
    const updated: UserSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.userSettings.set(userId, updated);
    notifyListeners();
    return updated;
  }

  // --- ACHIEVEMENTS ---
  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public unlockAchievement(achievementId: string): void {
    const item = this.achievements.find((a) => a.id === achievementId);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toISOString();
      notifyListeners();
    }
  }

  public async resetToDefaults(): Promise<void> {
    this.users = [...MOCK_PLAYERS, MOCK_ADMIN];
    this.pokedexEntries = [];
    this.arenaSessions = [];
    this.achievements = [...MOCK_ACHIEVEMENTS];
    this.userSettings.clear();
    this.gameConfig = { ...DEFAULT_GAME_CONFIG };
    this.featureFlags = { ...DEFAULT_FEATURE_FLAGS };
    notifyListeners();
  }
}

export const storageService = new StorageService();
export default storageService;
