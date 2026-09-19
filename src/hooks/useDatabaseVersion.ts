import { useEffect, useState } from 'react';
import { subscribeToDatabase } from '../services/sqliteDatabase';

/** Re-renders a view whenever the SQLite bridge refreshes its in-memory state. */
export function useDatabaseVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeToDatabase(() => setVersion((current) => current + 1)), []);

  return version;
}

export default useDatabaseVersion;
