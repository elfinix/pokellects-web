import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'pokellects.db');

let db: DatabaseSync | null = null;

export function getLocalSqliteDb(): DatabaseSync {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new DatabaseSync(DB_PATH);
  initSchemaAndSeed(db);
  return db;
}

function initSchemaAndSeed(database: DatabaseSync) {
  // 1. Users Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      gender TEXT NOT NULL,
      birthday TEXT NOT NULL,
      department TEXT,
      unlocked_pokemon_ids TEXT NOT NULL,
      stats_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pokedex_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      unlocked_at TEXT NOT NULL,
      discovery_method TEXT NOT NULL,
      UNIQUE(user_id, pokemon_id)
    );

    CREATE TABLE IF NOT EXISTS arena_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      game_type TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      is_won INTEGER NOT NULL,
      attempts_used INTEGER NOT NULL,
      time_taken_seconds REAL NOT NULL,
      played_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      target_count INTEGER NOT NULL,
      unlocked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'light',
      minigames_view TEXT NOT NULL DEFAULT 'grid',
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      reduced_motion INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_configs (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number | bigint };
  if (Number(userCount.count) === 0) {
    seedDatabase(database);
  }
}

export function seedDatabase(database: DatabaseSync) {
  // Clear any existing data
  database.exec(`
    DELETE FROM pokedex_entries;
    DELETE FROM arena_sessions;
    DELETE FROM achievements;
    DELETE FROM user_settings;
    DELETE FROM system_configs;
    DELETE FROM session_state;
    DELETE FROM users;
  `);

  // Mock Players
  const players = [
    {
      id: 'usr-player-1',
      username: 'ash_ketchum',
      firstName: 'Ash',
      lastName: 'Ketchum',
      email: 'ash@pokellects.dev',
      gender: 'male',
      birthday: '2001-05-22',
      role: 'player',
      unlockedPokemonIds: [1, 4, 7, 25],
      stats: { totalGuesses: 18, correctGuesses: 14, arenaWins: 8 },
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'usr-player-2',
      username: 'serena_kalos',
      firstName: 'Serena',
      lastName: 'Yvonne',
      email: 'serena@pokellects.dev',
      gender: 'female',
      birthday: '2002-10-15',
      role: 'player',
      unlockedPokemonIds: [653, 656],
      stats: { totalGuesses: 12, correctGuesses: 10, arenaWins: 5 },
      createdAt: '2026-02-01T12:00:00Z',
    },
    {
      id: 'usr-player-3',
      username: 'morgan_dex',
      firstName: 'Morgan',
      lastName: null,
      email: 'morgan@pokellects.dev',
      gender: 'non-binary',
      birthday: '1999-07-04',
      role: 'player',
      unlockedPokemonIds: [133, 196, 197],
      stats: { totalGuesses: 24, correctGuesses: 21, arenaWins: 12 },
      createdAt: '2026-02-15T09:30:00Z',
    },
  ];

  const admin = {
    id: 'usr-admin-1',
    username: 'prof_oak',
    firstName: 'Samuel',
    lastName: 'Oak',
    email: 'oak@pokellects.dev',
    gender: 'male',
    birthday: '1962-09-28',
    role: 'admin',
    department: 'Pokémon Ecological Research & Development',
    unlockedPokemonIds: [],
    stats: { totalGuesses: 0, correctGuesses: 0, arenaWins: 0 },
    createdAt: '2026-01-01T00:00:00Z',
  };

  const insertUser = database.prepare(
    'INSERT INTO users (id, username, email, role, first_name, last_name, gender, birthday, department, unlocked_pokemon_ids, stats_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const p of [...players, admin]) {
    insertUser.run(
      p.id,
      p.username,
      p.email,
      p.role,
      p.firstName,
      p.lastName || null,
      p.gender,
      p.birthday,
      (p as any).department || null,
      JSON.stringify(p.unlockedPokemonIds),
      JSON.stringify(p.stats),
      p.createdAt
    );

    if (p.role === 'player') {
      const insertPokedex = database.prepare(
        'INSERT OR IGNORE INTO pokedex_entries (id, user_id, pokemon_id, unlocked_at, discovery_method) VALUES (?, ?, ?, ?, ?)'
      );
      for (const pId of p.unlockedPokemonIds) {
        insertPokedex.run(`entry-${p.id}-${pId}`, p.id, pId, p.createdAt, 'starter_grant');
      }
    }
  }

  const insertUserSettings = database.prepare('INSERT INTO user_settings (user_id, theme, minigames_view, sound_enabled, reduced_motion, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const user of [...players, admin]) {
    insertUserSettings.run(user.id, 'light', 'grid', 1, 0, new Date().toISOString());
  }

  // Active Session
  database.prepare('INSERT INTO session_state (key, value) VALUES (?, ?)').run('active_user_id', 'usr-player-1');

  // Configs
  const defaultConfig = {
    whosThatPokemon: { timerSeconds: 15, showTypeHint: true, showGenerationHint: true, maxAttempts: 3, imageSize: 'normal' },
    hangmon: { maxStrikes: 6, showCategoryHint: true, timerSeconds: 45 },
    identicry: { replayCryLimit: 3, timerSeconds: 20, multipleChoiceOptions: 4, showHints: true },
    biologist: { showHints: true },
    general: { allowAnyGeneration: true, enabledGenerations: [1, 2, 3, 4, 5, 6, 7, 8, 9], pokemonFetch: 'undiscovered' },
  };

  const defaultFlags = {
    enableWhosThatPokemon: true,
    enableHangmon: true,
    enableIdenticry: true,
    enablePokedlePreview: true,
    enableAudioCries: true,
    enableConfetti: true,
  };

  const insertConfig = database.prepare('INSERT INTO system_configs (key, value_json, updated_at) VALUES (?, ?, ?)');
  insertConfig.run('game_config', JSON.stringify(defaultConfig), new Date().toISOString());
  insertConfig.run('feature_flags', JSON.stringify(defaultFlags), new Date().toISOString());
  insertConfig.run('admin_display_config', JSON.stringify({ theme: 'light' }), new Date().toISOString());

  // Achievements
  const achievements = [
    {
      id: 'ach-first-catch',
      userId: 'usr-player-1',
      title: 'First Step to Mastery',
      description: 'Register your very first Pokémon into the personal Pokédex.',
      category: 'collection',
      icon: 'Award',
      targetCount: 1,
      unlockedAt: '2026-01-10T08:15:00Z',
    },
    {
      id: 'ach-kanto-10',
      userId: 'usr-player-1',
      title: 'Kanto Explorer',
      description: 'Register at least 10 Pokémon originating from the Kanto region.',
      category: 'collection',
      icon: 'Compass',
      targetCount: 10,
      unlockedAt: null,
    },
    {
      id: 'ach-arena-champion',
      userId: 'usr-player-1',
      title: 'Arena Contender',
      description: 'Successfully complete 5 minigames in the Arena.',
      category: 'arena',
      icon: 'Swords',
      targetCount: 5,
      unlockedAt: '2026-01-15T14:20:00Z',
    },
    {
      id: 'ach-sound-master',
      userId: 'usr-player-1',
      title: 'Golden Ear',
      description: 'Win 3 rounds of Identicry without replaying the cry audio.',
      category: 'mastery',
      icon: 'Volume2',
      targetCount: 3,
      unlockedAt: null,
    },
  ];

  const insertAch = database.prepare(
    'INSERT INTO achievements (id, user_id, title, description, category, icon, target_count, unlocked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const a of achievements) {
    insertAch.run(a.id, a.userId, a.title, a.description, a.category, a.icon, a.targetCount, a.unlockedAt);
  }
}
