import { useEffect, useState } from 'react';
import { subscribeToStorage } from '../services/storageService';

/** Re-renders a view whenever local fallback storage refreshes. */
export function useDatabaseVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeToStorage(() => setVersion((current) => current + 1)), []);

  return version;
}

export default useDatabaseVersion;
