import { readLocalStorageItem, removeLocalStorageItem, writeLocalStorageItem } from './localStorage';
import { APP_LOCAL_STORAGE_KEYS, BODY_HEIGHT_KEY, BODY_METRICS_KEY, type AppLocalStorageKey, isAppLocalStorageKey } from './storageKeys';
import { loadBodyData, validateBodyAge, writeBodyData, type BodyDataSnapshot } from './bodyData';
import { validateBodyMetricEntries } from '../body/bodyMetrics';

type AppDataExport = {
  version: 3;
  exportedAt: string;
  localStorage: Partial<Record<AppLocalStorageKey, string>>;
  body: BodyDataSnapshot;
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

export function getAppDataExportFilename(date = new Date()) {
  return `pulse-trainer-${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}-${padDatePart(date.getHours())}-${padDatePart(date.getMinutes())}.json`;
}

export async function buildAppDataExport(date = new Date()): Promise<AppDataExport> {
  const localStorageData: AppDataExport['localStorage'] = {};

  for (const key of APP_LOCAL_STORAGE_KEYS) {
    if (key === BODY_METRICS_KEY || key === BODY_HEIGHT_KEY) continue;
    const value = readLocalStorageItem(key);
    if (value !== null) {
      localStorageData[key] = value;
    }
  }

  const body = await loadBodyData();
  return { version: 3, exportedAt: date.toISOString(), localStorage: localStorageData, body: body ?? { entries: [], height: '', age: '' } };
}

export async function serializeCurrentAppDataExport() {
  return JSON.stringify(await buildAppDataExport(), null, 2);
}

export async function downloadAppDataExport() {
  const blob = new Blob([await serializeCurrentAppDataExport()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getAppDataExportFilename();
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function importAppData(rawJson: string) {
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

  const record = parsed as { version?: unknown; body?: unknown };
  let body: BodyDataSnapshot | undefined;
  if (record.version === 3) {
    if (!record.body || typeof record.body !== 'object') throw new Error('Invalid app data export.');
    const candidate = record.body as Partial<BodyDataSnapshot>;
    if (!Array.isArray(candidate.entries) || typeof candidate.height !== 'string' || (candidate.age !== undefined && typeof candidate.age !== 'string')) throw new Error('Invalid app data export.');
    body = { entries: validateBodyMetricEntries(candidate.entries), height: candidate.height, age: validateBodyAge(candidate.age ?? '') };
  } else if (record.version === 2) {
    if (!record.body || typeof record.body !== 'object') throw new Error('Invalid app data export.');
    const candidate = record.body as Partial<BodyDataSnapshot>;
    if (!Array.isArray(candidate.entries) || typeof candidate.height !== 'string') throw new Error('Invalid app data export.');
    body = { entries: validateBodyMetricEntries(candidate.entries), height: candidate.height, age: '' };
  } else if (record.version !== 1 && record.version !== undefined) throw new Error('Invalid app data export.');
  if (!body) {
    const metrics = (localStorageData as Record<string, string>)[BODY_METRICS_KEY];
    const height = (localStorageData as Record<string, string>)[BODY_HEIGHT_KEY];
    const entries = metrics ? JSON.parse(metrics) : [];
    body = { entries: validateBodyMetricEntries(entries), height: height ?? '', age: '' };
  }
  for (const key of APP_LOCAL_STORAGE_KEYS) {
    if (key === BODY_METRICS_KEY || key === BODY_HEIGHT_KEY) continue;
    if (Object.prototype.hasOwnProperty.call(localStorageData, key)) {
      writeLocalStorageItem(key, (localStorageData as Record<string, string>)[key]);
    } else {
      removeLocalStorageItem(key);
    }
  }
  await writeBodyData(body);
  removeLocalStorageItem(BODY_METRICS_KEY);
  removeLocalStorageItem(BODY_HEIGHT_KEY);
}
