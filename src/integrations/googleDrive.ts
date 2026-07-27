import { getAppDataExportFilename, serializeCurrentAppDataExport } from '../data/appDataExport';
import { readLocalStorageItem, removeLocalStorageItem, writeLocalStorageItem } from '../data/localStorage';
import { GOOGLE_DRIVE_FOLDER_ID_KEY } from '../data/storageKeys';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';

type TokenResponse = { access_token?: string; error?: string; error_description?: string };
type TokenError = { type?: string; message?: string };

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: TokenError) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
        };
      };
    };
  }
}

export const isGoogleDriveConfigured = () => Boolean(GOOGLE_CLIENT_ID);

const loadGoogleIdentityScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => {
          existing.remove();
          reject(new Error('Google Identity Services failed to load.'));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error('Google Identity Services failed to load.'));
    };
    document.head.append(script);
  });

export const preloadGoogleDriveAuth = async () => {
  if (!isGoogleDriveConfigured()) {
    return;
  }

  await loadGoogleIdentityScript();
};

const requestAccessToken = async () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Drive is not configured.');
  }

  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services unavailable.');
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_FILE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Google authorization failed.'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message || error.type || 'Google authorization was cancelled.'));
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const driveFetch = async (url: string, accessToken: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Google Drive request failed (${response.status}).`);
  }

  return response;
};

const createPulseTrainerFolder = async (accessToken: string) => {
  const response = await driveFetch(DRIVE_FILES_URL, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pulse Trainer',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error('Google Drive folder was not created.');
  }
  writeLocalStorageItem(GOOGLE_DRIVE_FOLDER_ID_KEY, data.id);
  return data.id;
};

const ensurePulseTrainerFolder = async (accessToken: string) => {
  const storedFolderId = readLocalStorageItem(GOOGLE_DRIVE_FOLDER_ID_KEY);
  if (storedFolderId) {
    return storedFolderId;
  }

  return createPulseTrainerFolder(accessToken);
};

const uploadJsonFile = async (accessToken: string, folderId: string) => {
  const boundary = `pulse_trainer_${Date.now()}`;
  const filename = getAppDataExportFilename();
  const metadata = { name: filename, mimeType: 'application/json', parents: [folderId] };
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    await serializeCurrentAppDataExport(),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  await driveFetch(DRIVE_UPLOAD_URL, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
};

export async function exportAppDataToGoogleDrive() {
  if (!isGoogleDriveConfigured()) {
    throw new Error('Google Drive is not configured.');
  }

  const accessToken = await requestAccessToken();
  const storedFolderId = readLocalStorageItem(GOOGLE_DRIVE_FOLDER_ID_KEY);
  const folderId = await ensurePulseTrainerFolder(accessToken);

  try {
    await uploadJsonFile(accessToken, folderId);
  } catch (error) {
    if (!storedFolderId) {
      throw error;
    }

    removeLocalStorageItem(GOOGLE_DRIVE_FOLDER_ID_KEY);
    const nextFolderId = await createPulseTrainerFolder(accessToken);
    await uploadJsonFile(accessToken, nextFolderId);
  }
}
