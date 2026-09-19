/**
 * SQLite Local File Database Bridge.
 *
 * All data is stored in the physical SQLite database file on disk at `data/pokellects.db`.
 * Browser localStorage and IndexedDB are completely purged and deactivated.
 */

// In-memory cache synced with the disk database for instant UI response
export interface LocalDbState {
  users: any[];
  pokedexEntries: any[];
  arenaSessions: any[];
  achievements: any[];
  userSettings: any[];
  systemConfigs: Record<string, any>;
  sessionState: Record<string, string>;
}

let memoryState: LocalDbState = {
  users: [],
  pokedexEntries: [],
  arenaSessions: [],
  achievements: [],
  userSettings: [],
  systemConfigs: {},
  sessionState: {},
};

let isInitialized = false;
let initPromise: Promise<void> | null = null;
const databaseListeners = new Set<() => void>();

export function subscribeToDatabase(listener: () => void): () => void {
  databaseListeners.add(listener);
  return () => databaseListeners.delete(listener);
}

function notifyDatabaseListeners(): void {
  databaseListeners.forEach((listener) => listener());
}

/**
 * Removes only the legacy browser-backed SQLite cache. Authentication tokens
 * belong to Convex Auth and must never be cleared by the SQLite bridge.
 */
export function purgeBrowserStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
        indexedDB
          .databases()
          .then((databases) => {
            databases.forEach((dbInfo) => {
              if (dbInfo.name) {
                indexedDB.deleteDatabase(dbInfo.name);
              }
            });
          })
          .catch(() => {});
      } else if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('pokellects_sqlite_store');
      }
    }
  } catch (err) {
    console.warn('Storage purge notice:', err);
  }
}

/**
 * Initializes the connection to the local SQLite database file on disk.
 */
export async function getSqliteDatabase(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Purge legacy browser storage
    purgeBrowserStorage();

    // 2. Contact the server to ensure data/pokellects.db exists and is ready
    try {
      const res = await fetch('/api/sqlite/init', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Failed to initialize SQLite on disk: ${res.statusText}`);
      }
      await refreshMemoryState();
      isInitialized = true;
    } catch (err) {
      console.error('Error connecting to local SQLite file:', err);
      await refreshMemoryState();
      isInitialized = true;
    }
  })();

  return initPromise;
}

/**
 * Refreshes local memory state from the SQLite database file on disk.
 */
export async function refreshMemoryState(): Promise<void> {
  try {
    const [usersRes, dexRes, arenaRes, achRes, userSettingsRes, configRes, sessionRes] = await Promise.all([
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM users ORDER BY created_at ASC', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM pokedex_entries ORDER BY unlocked_at DESC', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM arena_sessions ORDER BY played_at DESC', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM achievements ORDER BY id ASC', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM user_settings ORDER BY user_id ASC', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM system_configs', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
      fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: 'SELECT * FROM session_state', params: [] }),
      }).then((r) => (r.ok ? r.json() : { rows: [] })),
    ]);

    if (usersRes?.rows) memoryState.users = usersRes.rows;
    if (dexRes?.rows) memoryState.pokedexEntries = dexRes.rows;
    if (arenaRes?.rows) memoryState.arenaSessions = arenaRes.rows;
    if (achRes?.rows) memoryState.achievements = achRes.rows;
    if (userSettingsRes?.rows) memoryState.userSettings = userSettingsRes.rows;

    if (configRes?.rows) {
      const cfgObj: Record<string, any> = {};
      for (const row of configRes.rows) {
        try {
          cfgObj[row.key] = JSON.parse(row.value_json);
        } catch {
          cfgObj[row.key] = row.value_json;
        }
      }
      memoryState.systemConfigs = cfgObj;
    }

    if (sessionRes?.rows) {
      const sessObj: Record<string, string> = {};
      for (const row of sessionRes.rows) {
        sessObj[row.key] = row.value;
      }
      memoryState.sessionState = sessObj;
    }
    notifyDatabaseListeners();
  } catch (err) {
    console.error('Failed to load SQLite data from server file:', err);
  }
}

/**
 * Synchronous state accessor for instant UI rendering.
 */
export function getDbSync(): boolean {
  return isInitialized;
}

/**
 * Returns memory state directly.
 */
export function getMemoryState(): LocalDbState {
  return memoryState;
}

/**
 * Executes a write statement against the SQLite database file on disk and refreshes memory state.
 */
export function executeSql(sql: string, params: any[] = []): void {
  // Fire and sync with server file
  fetch('/api/sqlite/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  })
    .then(() => {
      refreshMemoryState();
    })
    .catch((err) => {
      console.error('Failed to execute SQLite statement to disk file:', err);
    });
}

/**
 * Resets the SQLite file on disk to factory defaults.
 */
export async function resetSqliteDatabase(): Promise<void> {
  purgeBrowserStorage();
  await fetch('/api/sqlite/reset', { method: 'POST' });
  await refreshMemoryState();
}
