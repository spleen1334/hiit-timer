import { readLocalStorageItem, removeLocalStorageItem, writeLocalStorageItem } from './localStorage';
import { APP_LOCAL_STORAGE_KEYS, type AppLocalStorageKey, isAppLocalStorageKey } from './storageKeys';

type AppDataExport = {
  version: 1;
  exportedAt: string;
  localStorage: Partial<Record<AppLocalStorageKey, string>>;
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

export function getAppDataExportFilename(date = new Date()) {
  return `pulse-trainer-${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}-${padDatePart(date.getHours())}-${padDatePart(date.getMinutes())}.json`;
}

export function buildAppDataExport(date = new Date()): AppDataExport {
  const localStorageData: AppDataExport['localStorage'] = {};

  for (const key of APP_LOCAL_STORAGE_KEYS) {
    const value = readLocalStorageItem(key);
    if (value !== null) {
      localStorageData[key] = value;
    }
  }

  return { version: 1, exportedAt: date.toISOString(), localStorage: localStorageData };
}

export function serializeCurrentAppDataExport() {
  return JSON.stringify(buildAppDataExport(), null, 2);
}

export function downloadAppDataExport() {
  const blob = new Blob([serializeCurrentAppDataExport()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getAppDataExportFilename();
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function importAppData(rawJson: string) {
  const parsed = JSON.parse(rawJson) as unknown;

  if (!parsed || typeof parsed !== 'object' || !('localStorage' in parsed)) {
    throw new Error('Invalid app data export.');
  }

  const localStorageData = (parsed as { localStorage: unknown }).localStorage;
  if (!localStorageData || typeof localStorageData !== 'object' || Array.isArray(localStorageData)) {
    throw new Error('Invalid app data export.');
  }

  for (const [key, value] of Object.entries(localStorageData)) {
    if (!isAppLocalStorageKey(key) || typeof value !== 'string') {
      throw new Error('Invalid app data export.');
    }
  }

  for (const key of APP_LOCAL_STORAGE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(localStorageData, key)) {
      writeLocalStorageItem(key, (localStorageData as Record<string, string>)[key]);
    } else {
      removeLocalStorageItem(key);
    }
  }
}
