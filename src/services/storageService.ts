import { AppUser, PlayerUser, AdminUser, Gender, UserRole } from '../types/user';
import { UnlockedPokemonEntry } from '../types/pokemon';
import { GameConfiguration, FeatureFlags, ArenaGameType, Achievement } from '../types/game';
import {
  MOCK_PLAYERS,
  MOCK_ADMIN,
  DEFAULT_GAME_CONFIG,
  DEFAULT_FEATURE_FLAGS,
  MOCK_ACHIEVEMENTS,
} from './mockdata';
import {
  getSqliteDatabase,
  getMemoryState,
  executeSql,
  resetSqliteDatabase,
} from './sqliteDatabase';

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

/**
 * SQLite Local File Database Repository.
 * Powered by local SQLite database file (`data/pokellects.db`) on disk,
 * designed for seamless transition to Convex database in the future.
 */
class StorageService {
  private isReady = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    await getSqliteDatabase();
    this.isReady = true;
  }

  public async whenReady(): Promise<void> {
    return this.readyPromise;
  }

  // --- USER OPERATIONS (SQLite: users & session_state) ---
  public getUsers(): AppUser[] {
    const { users } = getMemoryState();
    if (!users || users.length === 0) {
      return [...MOCK_PLAYERS, MOCK_ADMIN];
    }

    return users.map((r: any) => {
      const unlockedIds: number[] = typeof r.unlocked_pokemon_ids === 'string'
        ? JSON.parse(r.unlocked_pokemon_ids || '[]')
        : (r.unlocked_pokemon_ids || []);
      const stats = typeof r.stats_json === 'string'
        ? JSON.parse(r.stats_json || '{"totalGuesses":0,"correctGuesses":0,"arenaWins":0}')
        : (r.stats || { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 });

      if (r.role === 'admin') {
        const admin: AdminUser = {
          id: r.id,
          username: r.username,
          email: r.email,
          role: 'admin',
          firstName: r.first_name || r.firstName,
          lastName: r.last_name || r.lastName || undefined,
          gender: r.gender,
          birthday: r.birthday,
          department: r.department || 'Administration',
          createdAt: r.created_at || r.createdAt,
        };
        return admin;
      }

      const player: PlayerUser = {
        id: r.id,
        username: r.username,
        email: r.email,
        role: 'player',
        firstName: r.first_name || r.firstName,
        lastName: r.last_name || r.lastName || undefined,
        gender: r.gender,
        birthday: r.birthday,
        createdAt: r.created_at || r.createdAt,
        unlockedPokemonIds: unlockedIds,
        stats: {
          totalGuesses: stats.totalGuesses || 0,
          correctGuesses: stats.correctGuesses || 0,
          arenaWins: stats.arenaWins || 0,
        },
      };
      return player;
    });
  }

  public getActiveUser(): AppUser | null {
    const { sessionState } = getMemoryState();
    const activeId = sessionState['active_user_id'] || MOCK_PLAYERS[0].id;
    const users = this.getUsers();
    return users.find((u) => u.id === activeId) || users[0] || null;
  }

  public setActiveUserId(userId: string): void {
    getMemoryState().sessionState['active_user_id'] = userId;
    executeSql('INSERT OR REPLACE INTO session_state (key, value) VALUES (?, ?)', ['active_user_id', userId]);
  }

  public updateUser(updated: AppUser): void {
    const unlockedIds = updated.role === 'player' ? (updated as PlayerUser).unlockedPokemonIds : [];
    const stats = updated.role === 'player' ? (updated as PlayerUser).stats : { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 };
    const department = updated.role === 'admin' ? (updated as AdminUser).department : null;

    // Update in-memory copy
    const users = getMemoryState().users;
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        first_name: updated.firstName,
        last_name: updated.lastName || null,
        gender: updated.gender,
        birthday: updated.birthday,
        department,
        unlocked_pokemon_ids: JSON.stringify(unlockedIds),
        stats_json: JSON.stringify(stats),
      };
    }

    executeSql(
      'UPDATE users SET first_name = ?, last_name = ?, gender = ?, birthday = ?, department = ?, unlocked_pokemon_ids = ?, stats_json = ? WHERE id = ?',
      [
        updated.firstName,
        updated.lastName || null,
        updated.gender,
        updated.birthday,
        department,
        JSON.stringify(unlockedIds),
        JSON.stringify(stats),
        updated.id,
      ]
    );
  }

  // --- POKEDEX ENTRIES (SQLite: pokedex_entries) ---
  public getPlayerUnlockedEntries(playerId: string): UnlockedPokemonEntry[] {
    const { pokedexEntries } = getMemoryState();
    const userEntries = (pokedexEntries || []).filter((e: any) => e.user_id === playerId);

    if (userEntries.length === 0) {
      const mock = MOCK_PLAYERS.find((p) => p.id === playerId);
      return (mock?.unlockedPokemonIds || []).map((id) => ({
        pokemonId: id,
        unlockedAt: mock?.createdAt || new Date().toISOString(),
        discoveryMethod: 'starter_grant',
      }));
    }

    return userEntries.map((r: any) => ({
      pokemonId: r.pokemon_id,
      unlockedAt: r.unlocked_at,
      discoveryMethod: r.discovery_method,
    }));
  }

  public registerPokemonToPlayer(
    playerId: string,
    pokemonId: number,
    method: UnlockedPokemonEntry['discoveryMethod'] = 'manual_dex_input'
  ): { isNew: boolean; entry: UnlockedPokemonEntry } {
    const { pokedexEntries } = getMemoryState();
    const existing = pokedexEntries.find((e: any) => e.user_id === playerId && e.pokemon_id === pokemonId);

    if (existing) {
      return {
        isNew: false,
        entry: {
          pokemonId: existing.pokemon_id,
          unlockedAt: existing.unlocked_at,
          discoveryMethod: existing.discovery_method as UnlockedPokemonEntry['discoveryMethod'],
        },
      };
    }

    const now = new Date().toISOString();
    const entryId = `entry-${playerId}-${pokemonId}-${Date.now()}`;

    // Update in-memory list
    pokedexEntries.unshift({
      id: entryId,
      user_id: playerId,
      pokemon_id: pokemonId,
      unlocked_at: now,
      discovery_method: method,
    });

    executeSql(
      'INSERT OR IGNORE INTO pokedex_entries (id, user_id, pokemon_id, unlocked_at, discovery_method) VALUES (?, ?, ?, ?, ?)',
      [entryId, playerId, pokemonId, now, method]
    );

    // Sync user's quick unlocked array in the users table
    const users = this.getUsers();
    const target = users.find((u) => u.id === playerId);
    if (target && target.role === 'player') {
      const player = target as PlayerUser;
      if (!player.unlockedPokemonIds.includes(pokemonId)) {
        player.unlockedPokemonIds = [...player.unlockedPokemonIds, pokemonId];
        this.updateUser(player);
      }
    }

    return {
      isNew: true,
      entry: {
        pokemonId,
        unlockedAt: now,
        discoveryMethod: method,
      },
    };
  }

  // --- ARENA SESSIONS (SQLite: arena_sessions) ---
  public recordArenaSession(session: Omit<ArenaSessionRecord, 'id' | 'playedAt'>): ArenaSessionRecord {
    const id = `arena-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const playedAt = new Date().toISOString();

    const newRecord = {
      id,
      user_id: session.userId,
      game_type: session.gameType,
      pokemon_id: session.pokemonId,
      is_won: session.isWon ? 1 : 0,
      attempts_used: session.attemptsUsed,
      time_taken_seconds: session.timeTakenSeconds,
      played_at: playedAt,
    };

    getMemoryState().arenaSessions.unshift(newRecord);

    executeSql(
      'INSERT INTO arena_sessions (id, user_id, game_type, pokemon_id, is_won, attempts_used, time_taken_seconds, played_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        session.userId,
        session.gameType,
        session.pokemonId,
        session.isWon ? 1 : 0,
        session.attemptsUsed,
        session.timeTakenSeconds,
        playedAt,
      ]
    );

    return {
      ...session,
      id,
      playedAt,
    };
  }

  public getArenaSessions(userId?: string): ArenaSessionRecord[] {
    const { arenaSessions } = getMemoryState();
    const rows = userId
      ? arenaSessions.filter((s: any) => s.user_id === userId)
      : arenaSessions;

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      gameType: r.game_type,
      pokemonId: r.pokemon_id,
      isWon: r.is_won === 1 || r.is_won === true,
      attemptsUsed: r.attempts_used,
      timeTakenSeconds: r.time_taken_seconds,
      playedAt: r.played_at,
    }));
  }

  // --- CONFIGURATIONS & FEATURE FLAGS (SQLite: system_configs) ---
  public getGameConfig(): GameConfiguration {
    const { systemConfigs } = getMemoryState();
    return systemConfigs['game_config'] || DEFAULT_GAME_CONFIG;
  }

  public updateGameConfig(config: Partial<GameConfiguration>): GameConfiguration {
    const current = this.getGameConfig();
    const updated = { ...current, ...config };
    getMemoryState().systemConfigs['game_config'] = updated;
    executeSql('INSERT OR REPLACE INTO system_configs (key, value_json, updated_at) VALUES (?, ?, ?)', [
      'game_config',
      JSON.stringify(updated),
      new Date().toISOString(),
    ]);
    return updated;
  }

  public getFeatureFlags(): FeatureFlags {
    const { systemConfigs } = getMemoryState();
    return systemConfigs['feature_flags'] || DEFAULT_FEATURE_FLAGS;
  }

  public updateFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    const current = this.getFeatureFlags();
    const updated = { ...current, ...flags };
    getMemoryState().systemConfigs['feature_flags'] = updated;
    executeSql('INSERT OR REPLACE INTO system_configs (key, value_json, updated_at) VALUES (?, ?, ?)', [
      'feature_flags',
      JSON.stringify(updated),
      new Date().toISOString(),
    ]);
    return updated;
  }

  // --- ACHIEVEMENTS (SQLite: achievements) ---
  public getAchievements(): Achievement[] {
    const { achievements } = getMemoryState();
    if (!achievements || achievements.length === 0) return MOCK_ACHIEVEMENTS;

    return achievements.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      category: r.category,
      targetCount: r.target_count || r.targetCount,
      unlockedAt: r.unlocked_at || r.unlockedAt || undefined,
    }));
  }

  public unlockAchievement(achievementId: string): void {
    const now = new Date().toISOString();
    const achs = getMemoryState().achievements;
    const item = achs.find((a: any) => a.id === achievementId);
    if (item && !item.unlocked_at) {
      item.unlocked_at = now;
    }
    executeSql('UPDATE achievements SET unlocked_at = ? WHERE id = ? AND unlocked_at IS NULL', [now, achievementId]);
  }

  /**
   * Resets progress and restores SQLite database to factory defaults.
   */
  public async resetToDefaults(): Promise<void> {
    await resetSqliteDatabase();
  }
}

export const storageService = new StorageService();
export default storageService;
