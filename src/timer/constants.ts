import type { TimerSettings } from './types';

export const MAX_HISTORY = 3;
export const TICK_MS = 100;

export const DEFAULT_SETTINGS: TimerSettings = {
  activeSeconds: 40,
  restSeconds: 20,
  rounds: 8,
  initialDelay: 3,
  soundEnabled: true,
};
