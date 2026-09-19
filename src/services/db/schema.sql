-- Pokellects SQLite Database Schema Definition
-- Prepared for SQLite / Serverless SQL & Convex Data Synchronization

PRAGMA foreign_keys = ON;

-- 1. Users Table (Players and Administrators)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    gender TEXT CHECK (gender IN ('male', 'female', 'non-binary')) NOT NULL,
    birthday TEXT NOT NULL,
    role TEXT CHECK (role IN ('player', 'admin')) NOT NULL DEFAULT 'player',
    department TEXT, -- Only for Admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Personal Pokédex Registrations
CREATE TABLE IF NOT EXISTS pokedex_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pokemon_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    discovery_method TEXT NOT NULL CHECK (
        discovery_method IN ('manual_dex_input', 'whos_that_pokemon', 'hangmon', 'identicry', 'starter_grant')
    ),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, pokemon_id)
);

-- 3. Arena Minigame History
CREATE TABLE IF NOT EXISTS arena_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (
        game_type IN ('whos_that_pokemon', 'hangmon', 'identicry', 'pokedle')
    ),
    pokemon_id INTEGER NOT NULL,
    is_won INTEGER NOT NULL CHECK (is_won IN (0, 1)),
    attempts_used INTEGER DEFAULT 1,
    time_taken_seconds REAL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Dynamic System Configurations & Feature Flags
CREATE TABLE IF NOT EXISTS system_configs (
    config_key TEXT PRIMARY KEY,
    config_value JSON NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_key TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_key)
);

-- 6. Per-user display and accessibility preferences
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT 'light',
    minigames_view TEXT NOT NULL DEFAULT 'grid',
    sound_enabled INTEGER NOT NULL DEFAULT 1,
    reduced_motion INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexing for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_pokedex_user ON pokedex_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_pokedex_pokemon ON pokedex_entries(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_arena_user_game ON arena_sessions(user_id, game_type);
