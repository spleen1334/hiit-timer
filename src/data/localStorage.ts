export const readLocalStorageItem = (key: string) => globalThis.localStorage?.getItem(key) ?? null;

export const writeLocalStorageItem = (key: string, value: string) => {
  globalThis.localStorage?.setItem(key, value);
};

export const removeLocalStorageItem = (key: string) => {
  globalThis.localStorage?.removeItem(key);
};
