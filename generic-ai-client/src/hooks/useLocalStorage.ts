'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * An SSR-safe React hook that persists state to localStorage.
 * Prevents hydration mismatches by initializing with the default value
 * and reading from localStorage only after the component has mounted on the client.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}" from localStorage:`, error);
    }
  }, [key]);

  // Setter function that updates state and localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((currentValue) => {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting key "${key}" in localStorage:`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
