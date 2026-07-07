export const TIMER_SETTINGS_KEY = 'pulse-hiit-settings';
export const TIMER_LOCALE_KEY = 'pulse-hiit-locale';
export const TIMER_HISTORY_KEY = 'pulse-hiit-history';
export const STATS_PANEL_OPEN_KEY = 'pulse-hiit-stats-panel-open';
export const APP_VIEW_KEY = 'pulse-trainer-app-view';
export const TRAINING_PROGRAM_KEY = 'pulse-trainer-program';
export const PLAN_SECTION_VISIBILITY_KEY = 'pulse-trainer-plan-section-visibility';
export const BODY_METRICS_KEY = 'pulse-trainer-body-metrics';
export const BODY_HEIGHT_KEY = 'pulse-trainer-body-height';
export const GOOGLE_DRIVE_FOLDER_ID_KEY = 'pulse-trainer-google-drive-folder-id';

export const APP_LOCAL_STORAGE_KEYS = [
  TIMER_SETTINGS_KEY,
  TIMER_HISTORY_KEY,
  TIMER_LOCALE_KEY,
  STATS_PANEL_OPEN_KEY,
  APP_VIEW_KEY,
  TRAINING_PROGRAM_KEY,
  PLAN_SECTION_VISIBILITY_KEY,
  BODY_METRICS_KEY,
  BODY_HEIGHT_KEY,
  GOOGLE_DRIVE_FOLDER_ID_KEY,
] as const;

export type AppLocalStorageKey = (typeof APP_LOCAL_STORAGE_KEYS)[number];

export const isAppLocalStorageKey = (key: string): key is AppLocalStorageKey =>
  (APP_LOCAL_STORAGE_KEYS as readonly string[]).includes(key);
