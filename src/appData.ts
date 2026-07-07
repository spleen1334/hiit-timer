import {
  APP_VIEW_KEY,
  BODY_HEIGHT_KEY,
  BODY_METRICS_KEY,
  PLAN_SECTION_VISIBILITY_KEY,
  TRAINING_PROGRAM_KEY,
} from './plan/constants';
import { HISTORY_KEY, LOCALE_KEY, SETTINGS_KEY, STATS_PANEL_KEY } from './timer/constants';

export const APP_LOCAL_STORAGE_KEYS = [
  SETTINGS_KEY,
  HISTORY_KEY,
  LOCALE_KEY,
  STATS_PANEL_KEY,
  APP_VIEW_KEY,
  TRAINING_PROGRAM_KEY,
  PLAN_SECTION_VISIBILITY_KEY,
  BODY_METRICS_KEY,
  BODY_HEIGHT_KEY,
] as const;

type AppLocalStorageKey = (typeof APP_LOCAL_STORAGE_KEYS)[number];

type AppDataExport = {
  version: 1;
  exportedAt: string;
  localStorage: Partial<Record<AppLocalStorageKey, string>>;
};

const isAppKey = (key: string): key is AppLocalStorageKey =>
  (APP_LOCAL_STORAGE_KEYS as readonly string[]).includes(key);

export function downloadAppDataExport() {
  const localStorageData: AppDataExport['localStorage'] = {};

  for (const key of APP_LOCAL_STORAGE_KEYS) {
    const value = globalThis.localStorage?.getItem(key);
    if (value !== null && value !== undefined) {
      localStorageData[key] = value;
    }
  }

  const payload: AppDataExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    localStorage: localStorageData,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pulse-trainer-data-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (!isAppKey(key) || typeof value !== 'string') {
      throw new Error('Invalid app data export.');
    }
  }

  for (const key of APP_LOCAL_STORAGE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(localStorageData, key)) {
      globalThis.localStorage?.setItem(key, (localStorageData as Record<string, string>)[key]);
    } else {
      globalThis.localStorage?.removeItem(key);
    }
  }
}
