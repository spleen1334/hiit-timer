import { useEffect, useRef, useState } from 'react';
import { readLocalStorageItem, writeLocalStorageItem } from '../data/localStorage';
import type { PersistedStateSpec } from '../data/persistedState';

type PersistentStateOptions<T> = {
  parse: (stored: string) => T;
  serialize?: (value: T) => string;
  recover?: (value: T, error: unknown) => T | undefined;
  skipInitialPersist?: boolean;
};

const defaultSerialize = <T,>(value: T) => JSON.stringify(value);

export function usePersistentState<T>(
  key: string,
  getFallback: () => T,
  options: PersistentStateOptions<T>,
) {
  const { parse, serialize = defaultSerialize } = options;
  const isInitialPersist = useRef(true);
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
    if (options.skipInitialPersist && isInitialPersist.current) {
      isInitialPersist.current = false;
      return;
    }

    isInitialPersist.current = false;

    try {
      writeLocalStorageItem(key, serialize(value));
    } catch (error) {
      if (!options.recover) {
        return;
      }

      let candidate = value;
      let recoveryError = error;

      while (true) {
        const recoveredValue = options.recover(candidate, recoveryError);

        if (recoveredValue === undefined || serialize(recoveredValue) === serialize(candidate)) {
          return;
        }

        try {
          writeLocalStorageItem(key, serialize(recoveredValue));
          setValue(recoveredValue);
          return;
        } catch (nextError) {
          candidate = recoveredValue;
          recoveryError = nextError;
        }
      }
    }
  }, [key, options, serialize, value]);

  return [value, setValue] as const;
}

export function usePersistedState<T>(spec: PersistedStateSpec<T>) {
  return usePersistentState(spec.key, spec.fallback, spec);
}
