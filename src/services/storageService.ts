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

const STORAGE_KEYS = {
  USERS: 'pokellects_users',
  ACTIVE_USER_ID: 'pokellects_active_user_id',
  POKEDEX_ENTRIES: 'pokellects_pokedex_entries',
  ARENA_SESSIONS: 'pokellects_arena_sessions',
  GAME_CONFIG: 'pokellects_game_config',
  FEATURE_FLAGS: 'pokellects_feature_flags',
  ACHIEVEMENTS: 'pokellects_achievements',
};

/**
 * SQLite-compatible Repository Storage Service.
 * Implements persistent CRUD operations conforming to our SQLite schema.sql,
 * currently backed by browser local storage, with zero friction for SQLite/Convex transition.
 */
class StorageService {
  constructor() {
    this.initializeIfEmpty();
  }

  private initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const allUsers: AppUser[] = [...MOCK_PLAYERS, MOCK_ADMIN];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
      // Default to Ash Ketchum for seamless out-of-the-box demo experience
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, MOCK_PLAYERS[0].id);
    }

    if (!localStorage.getItem(STORAGE_KEYS.POKEDEX_ENTRIES)) {
      // Seed default unlocked entries for mock players
      const initialEntries: Record<string, UnlockedPokemonEntry[]> = {};
      MOCK_PLAYERS.forEach((p) => {
        initialEntries[p.id] = p.unlockedPokemonIds.map((id) => ({
          pokemonId: id,
          unlockedAt: p.createdAt,
          discoveryMethod: 'starter_grant',
        }));
      });
      localStorage.setItem(STORAGE_KEYS.POKEDEX_ENTRIES, JSON.stringify(initialEntries));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GAME_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.GAME_CONFIG, JSON.stringify(DEFAULT_GAME_CONFIG));
    }

    if (!localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)) {
      localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(DEFAULT_FEATURE_FLAGS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(MOCK_ACHIEVEMENTS));
    }
  }

  // --- USER OPERATIONS ---
  public getUsers(): AppUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [...MOCK_PLAYERS, MOCK_ADMIN];
  }

  public getActiveUser(): AppUser | null {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    const users = this.getUsers();
    return users.find((u) => u.id === activeId) || users[0] || null;
  }

  public setActiveUserId(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }

  public updateUser(updated: AppUser): void {
    const users = this.getUsers().map((u) => (u.id === updated.id ? updated : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- POKEDEX ENTRIES (SQLite: pokedex_entries) ---
  public getPlayerUnlockedEntries(playerId: string): UnlockedPokemonEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POKEDEX_ENTRIES);
    const allEntries: Record<string, UnlockedPokemonEntry[]> = raw ? JSON.parse(raw) : {};
    return allEntries[playerId] || [];
  }

  public registerPokemonToPlayer(
    playerId: string,
    pokemonId: number,
    method: UnlockedPokemonEntry['discoveryMethod'] = 'manual_dex_input'
  ): { isNew: boolean; entry: UnlockedPokemonEntry } {
    const raw = localStorage.getItem(STORAGE_KEYS.POKEDEX_ENTRIES);
    const allEntries: Record<string, UnlockedPokemonEntry[]> = raw ? JSON.parse(raw) : {};
    const playerList = allEntries[playerId] || [];

    const existing = playerList.find((e) => e.pokemonId === pokemonId);
    if (existing) {
      return { isNew: false, entry: existing };
    }

    const newEntry: UnlockedPokemonEntry = {
      pokemonId,
      unlockedAt: new Date().toISOString(),
      discoveryMethod: method,
    };

    allEntries[playerId] = [newEntry, ...playerList];
    localStorage.setItem(STORAGE_KEYS.POKEDEX_ENTRIES, JSON.stringify(allEntries));

    // Also sync the player's quick lookup unlocked array
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === playerId);
    if (userIndex !== -1 && users[userIndex].role === 'player') {
      const player = users[userIndex] as PlayerUser;
      if (!player.unlockedPokemonIds.includes(pokemonId)) {
        player.unlockedPokemonIds = [...player.unlockedPokemonIds, pokemonId];
        this.updateUser(player);
      }
    }

    return { isNew: true, entry: newEntry };
  }

  // --- ARENA SESSIONS (SQLite: arena_sessions) ---
  public recordArenaSession(session: Omit<ArenaSessionRecord, 'id' | 'playedAt'>): ArenaSessionRecord {
    const raw = localStorage.getItem(STORAGE_KEYS.ARENA_SESSIONS);
    const sessions: ArenaSessionRecord[] = raw ? JSON.parse(raw) : [];

    const newRecord: ArenaSessionRecord = {
      ...session,
      id: `arena-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      playedAt: new Date().toISOString(),
    };

    sessions.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ARENA_SESSIONS, JSON.stringify(sessions));
    return newRecord;
  }

  public getArenaSessions(userId?: string): ArenaSessionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ARENA_SESSIONS);
    const sessions: ArenaSessionRecord[] = raw ? JSON.parse(raw) : [];
    return userId ? sessions.filter((s) => s.userId === userId) : sessions;
  }

  // --- CONFIGURATIONS & FEATURE FLAGS (SQLite: system_configs) ---
  public getGameConfig(): GameConfiguration {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_GAME_CONFIG;
  }

  public updateGameConfig(config: Partial<GameConfiguration>): GameConfiguration {
    const current = this.getGameConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.GAME_CONFIG, JSON.stringify(updated));
    return updated;
  }

  public getFeatureFlags(): FeatureFlags {
    const raw = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS);
    return raw ? JSON.parse(raw) : DEFAULT_FEATURE_FLAGS;
  }

  public updateFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    const current = this.getFeatureFlags();
    const updated = { ...current, ...flags };
    localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(updated));
    return updated;
  }

  // --- ACHIEVEMENTS (SQLite: user_achievements) ---
  public getAchievements(): Achievement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return raw ? JSON.parse(raw) : MOCK_ACHIEVEMENTS;
  }

  public unlockAchievement(achievementId: string): void {
    const list = this.getAchievements().map((ach) => {
      if (ach.id === achievementId && !ach.unlockedAt) {
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(list));
  }

  /**
   * Resets progress for testing and clean slate
   */
  public resetToDefaults(): void {
    localStorage.clear();
    this.initializeIfEmpty();
  }
}

export const storageService = new StorageService();
export default storageService;
