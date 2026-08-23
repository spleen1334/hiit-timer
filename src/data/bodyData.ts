import { sanitizeBodyMetricEntries, validateBodyMetricEntries, type BodyMetricEntry } from '../body/bodyMetrics';
import { readLocalStorageItem, removeLocalStorageItem } from './localStorage';
import { BODY_HEIGHT_KEY, BODY_METRICS_KEY } from './storageKeys';

export type BodyDataSnapshot = { entries: BodyMetricEntry[]; height: string; age: string };
export type BodyProfile = { height: string; age: string };

const BODY_AGE_PATTERN = /^(?:[1-9]|[1-9][0-9]|1[01][0-9]|120)$/;

export const normalizeBodyAge = (value: unknown) => {
  const age = typeof value === 'string' ? value.trim() : '';

  return BODY_AGE_PATTERN.test(age) ? age : '';
};

export const validateBodyAge = (value: unknown) => {
  if (typeof value !== 'string' || (value !== '' && normalizeBodyAge(value) === '')) {
    throw new Error('Invalid body age.');
  }

  return normalizeBodyAge(value);
};

export const normalizeBodyDataSnapshot = (value: unknown): BodyDataSnapshot | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const candidate = value as Partial<BodyDataSnapshot>;

  return {
    entries: candidate.entries as BodyMetricEntry[],
    height: typeof candidate.height === 'string' ? candidate.height : '',
    age: normalizeBodyAge(candidate.age),
  };
};
const DB_NAME = 'pulse-trainer-body';
const STORE_NAME = 'snapshots';
const RECORD_KEY = 'body';
let initialization: Promise<BodyDataSnapshot | undefined> | undefined;

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const readBodyData = async (): Promise<BodyDataSnapshot | undefined> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(normalizeBodyDataSnapshot(request.result));
    request.onerror = () => reject(request.error);
  });
};

export const writeBodyData = async (snapshot: BodyDataSnapshot) => {
  const normalized = normalizeBodyDataSnapshot(snapshot);

  if (!normalized) throw new Error('Invalid body data snapshot.');

  const age = snapshot.age === undefined ? '' : validateBodyAge(snapshot.age);

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ ...normalized, age }, RECORD_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const clearBodyDataStore = () => writeBodyData({ entries: [], height: '', age: '' });

const readLegacySnapshot = (): BodyDataSnapshot | undefined => {
  const metrics = readLocalStorageItem(BODY_METRICS_KEY);
  const height = readLocalStorageItem(BODY_HEIGHT_KEY);
  if (metrics === null && height === null) return undefined;
  const raw = metrics === null ? [] : JSON.parse(metrics) as unknown;
  if (!Array.isArray(raw)) throw new Error('Unreadable legacy body data.');
  const entries = validateBodyMetricEntries(raw);
  return { entries, height: height ?? '', age: '' };
};

const initializeBodyData = async () => {
  const existing = await readBodyData();
  if (existing) {
    try { removeLocalStorageItem(BODY_METRICS_KEY); removeLocalStorageItem(BODY_HEIGHT_KEY); } catch { /* preserve the readable snapshot */ }
    return existing;
  }
  const legacy = readLegacySnapshot();
  if (!legacy) return await readBodyData();
  const db = await openDatabase();
  return new Promise<BodyDataSnapshot>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(RECORD_KEY);
    let winner: BodyDataSnapshot | undefined;
    request.onsuccess = () => {
      winner = normalizeBodyDataSnapshot(request.result) ?? legacy;
      if (request.result === undefined) store.put(legacy, RECORD_KEY);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => { try { removeLocalStorageItem(BODY_METRICS_KEY); removeLocalStorageItem(BODY_HEIGHT_KEY); resolve(winner as BodyDataSnapshot); } catch (error) { reject(error); } };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const loadBodyData = () => {
  if (!initialization) {
    initialization = initializeBodyData().finally(() => {
      initialization = undefined;
    });
  }
  return initialization;
};
