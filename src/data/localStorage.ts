export const readLocalStorageItem = (key: string) => globalThis.localStorage?.getItem(key) ?? null;

export const writeLocalStorageItem = (key: string, value: string) => {
  globalThis.localStorage?.setItem(key, value);
};

export const isLocalStorageQuotaError = (error: unknown) => {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014;
  }

  return Boolean(error && typeof error === 'object' && 'name' in error &&
    ((error as { name?: unknown }).name === 'QuotaExceededError' ||
      (error as { name?: unknown }).name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error as { code?: unknown }).code === 22 || (error as { code?: unknown }).code === 1014));
};

export const removeLocalStorageItem = (key: string) => {
  globalThis.localStorage?.removeItem(key);
};
