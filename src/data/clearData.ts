import { writeLocalStorageItem, removeLocalStorageItem } from './localStorage';
import { BODY_HEIGHT_KEY, BODY_METRICS_KEY, TIMER_HISTORY_KEY } from './storageKeys';

export function clearStoredTimerHistory() {
  writeLocalStorageItem(TIMER_HISTORY_KEY, JSON.stringify([]));
}

export function clearBodyData() {
  writeLocalStorageItem(BODY_METRICS_KEY, JSON.stringify([]));
  removeLocalStorageItem(BODY_HEIGHT_KEY);
}
