import { writeLocalStorageItem, removeLocalStorageItem } from './localStorage';
import { BODY_HEIGHT_KEY, BODY_METRICS_KEY, TIMER_HISTORY_KEY } from './storageKeys';
import { clearBodyDataStore } from './bodyData';

export function clearStoredTimerHistory() {
  writeLocalStorageItem(TIMER_HISTORY_KEY, JSON.stringify([]));
}

export async function clearBodyData() {
  await clearBodyDataStore();
  removeLocalStorageItem(BODY_METRICS_KEY);
  removeLocalStorageItem(BODY_HEIGHT_KEY);
}
