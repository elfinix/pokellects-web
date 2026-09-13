import { useEffect } from 'react';

/**
 * Custom hook to bind hotkeys (e.g. 'Escape', 'Enter', '/')
 */
export function useHotkeys(key: string, callback: (event: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback]);
}

export default useHotkeys;
