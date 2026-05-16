import { useEffect, useState } from 'react';

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
    const stored = globalThis.localStorage?.getItem(key);

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
    window.localStorage.setItem(key, serialize(value));
  }, [key, serialize, value]);

  return [value, setValue] as const;
}
