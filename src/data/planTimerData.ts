import { readLocalStorageItem, removeLocalStorageItem, writeLocalStorageItem } from './localStorage';
import { APP_LOCAL_STORAGE_KEYS, BODY_HEIGHT_KEY, BODY_METRICS_KEY, type AppLocalStorageKey, isAppLocalStorageKey } from './storageKeys';

const TYPE = 'pulse-trainer-plan-timer';
const keys = APP_LOCAL_STORAGE_KEYS.filter((key) => key !== BODY_HEIGHT_KEY && key !== BODY_METRICS_KEY) as AppLocalStorageKey[];
type Payload = { type: typeof TYPE; version: 1; localStorage: Partial<Record<AppLocalStorageKey, string>> };

export async function buildPlanTimerDataExport(): Promise<Payload> {
  const localStorage: Payload['localStorage'] = {};
  for (const key of keys) { const value = readLocalStorageItem(key); if (value !== null) localStorage[key] = value; }
  return { type: TYPE, version: 1, localStorage };
}

export async function serializePlanTimerDataExport() { return JSON.stringify(await buildPlanTimerDataExport(), null, 2); }
export async function downloadPlanTimerDataExport() {
  const blob = new Blob([await serializePlanTimerDataExport()], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pulse-trainer-plan-timer.json'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
export async function importPlanTimerData(rawJson: string) {
  const parsed = JSON.parse(rawJson) as Partial<Payload>;
  if (parsed.type !== TYPE || parsed.version !== 1 || !parsed.localStorage || typeof parsed.localStorage !== 'object' || Array.isArray(parsed.localStorage)) throw new Error('Invalid plan and timer export.');
  const data = parsed.localStorage as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) if (!isAppLocalStorageKey(key) || keys.indexOf(key as AppLocalStorageKey) < 0 || typeof value !== 'string') throw new Error('Invalid plan and timer export.');
  for (const key of keys) { if (Object.prototype.hasOwnProperty.call(data, key)) writeLocalStorageItem(key, data[key] as string); else removeLocalStorageItem(key); }
}
