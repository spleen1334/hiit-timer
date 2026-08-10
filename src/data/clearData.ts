import { removeLocalStorageItem } from './localStorage';
import { BODY_HEIGHT_KEY, BODY_METRICS_KEY } from './storageKeys';
import { clearBodyDataStore } from './bodyData';

export async function clearBodyData() {
  await clearBodyDataStore();
  removeLocalStorageItem(BODY_METRICS_KEY);
  removeLocalStorageItem(BODY_HEIGHT_KEY);
}
