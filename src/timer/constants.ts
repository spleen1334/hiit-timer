import type { TimerSettings } from './types';

export const SETTINGS_KEY = 'pulse-hiit-settings';
export const LOCALE_KEY = 'pulse-hiit-locale';
export const HISTORY_KEY = 'pulse-hiit-history';
export const SETTINGS_PANEL_KEY = 'pulse-hiit-settings-panel-open';
export const STATS_PANEL_KEY = 'pulse-hiit-stats-panel-open';
export const MAX_HISTORY = 12;
export const TICK_MS = 100;

export const DEFAULT_SETTINGS: TimerSettings = {
  activeSeconds: 40,
  restSeconds: 20,
  rounds: 8,
  initialDelay: 3,
  soundEnabled: true,
};
