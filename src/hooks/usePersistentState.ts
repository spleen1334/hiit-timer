import { useEffect, useState } from 'react';
import { readLocalStorageItem, writeLocalStorageItem } from '../data/localStorage';
import type { PersistedStateSpec } from '../data/persistedState';

type PersistentStateOptions<T> = {
  parse: (stored: string) => T;
  serialize?: (value: T) => string;
};

const defaultSerialize = <T,>(value: T) => JSON.stringify(value);

export function usePersistentState<T>(
  key: string,
  getFallback: () => T,
  { parse, serialize = defaultSerialize }: PersistentStateOptions<T>,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = readLocalStorageItem(key);

    if (stored === null || stored === undefined) {
      return getFallback();
    }

    try {
      return parse(stored);
    } catch {
      return getFallback();
    }
  });

  useEffect(() => {
    writeLocalStorageItem(key, serialize(value));
  }, [key, serialize, value]);

  return [value, setValue] as const;
}

export function usePersistedState<T>(spec: PersistedStateSpec<T>) {
  return usePersistentState(spec.key, spec.fallback, spec);
}
