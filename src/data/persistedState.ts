import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n';
import type { AppViewMode } from '../app/types';
import { DEFAULT_PROGRAM } from '../plan/defaultProgram';
import type { SectionVisibility, TrainingProgram } from '../plan/types';
import { sanitizeTrainingProgram } from '../plan/sanitizeProgram';
import { DEFAULT_SETTINGS } from '../timer/constants';
import { readStoredBoolean, sanitizeHistory, sanitizeSettings } from '../timer/math';
import type { HistoryEntry, TimerSettings, TimerToolMode } from '../timer/types';
import {
  APP_VIEW_KEY,
  PLAN_SECTION_VISIBILITY_KEY,
  STATS_PANEL_OPEN_KEY,
  TIMER_HISTORY_KEY,
  TIMER_LOCALE_KEY,
  TIMER_SETTINGS_KEY,
  TIMER_TOOL_KEY,
  TRAINING_PROGRAM_KEY,
} from './storageKeys';
import { readLocalStorageItem } from './localStorage';

const serializeString = (value: string) => value;
const serializeBoolean = (value: boolean) => String(value);
const isAppViewMode = (value: string): value is AppViewMode => value === 'timer' || value === 'plan' || value === 'body';
const isTimerToolMode = (value: string): value is TimerToolMode => value === 'hiit' || value === 'stopwatch';
export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  warmup: true,
  workout: true,
  cardio: true,
  cooldown: true,
  notes: true,
};

export const sanitizeSectionVisibility = (value: unknown): SectionVisibility => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SECTION_VISIBILITY;
  }

  const candidate = value as Partial<SectionVisibility>;
  return {
    warmup: candidate.warmup ?? true,
    workout: candidate.workout ?? true,
    cardio: candidate.cardio ?? true,
    cooldown: candidate.cooldown ?? true,
    notes: candidate.notes ?? true,
  };
};

export type PersistedStateSpec<T> = {
  key: string;
  fallback: () => T;
  parse: (stored: string) => T;
  serialize?: (value: T) => string;
  recover?: (value: T, error: unknown) => T | undefined;
  skipInitialPersist?: boolean;
};

export const persistedState = {
  timerSettings: {
    key: TIMER_SETTINGS_KEY,
    fallback: () => sanitizeSettings(DEFAULT_SETTINGS),
    parse: (stored: string) => sanitizeSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }),
  } satisfies PersistedStateSpec<TimerSettings>,
  timerHistory: {
    key: TIMER_HISTORY_KEY,
    fallback: () => [] as HistoryEntry[],
    parse: (stored: string) => sanitizeHistory(JSON.parse(stored)),
  } satisfies PersistedStateSpec<HistoryEntry[]>,
  timerTool: {
    key: TIMER_TOOL_KEY,
    fallback: () => 'hiit' as TimerToolMode,
    parse: (stored: string) => (isTimerToolMode(stored) ? stored : 'hiit'),
    serialize: serializeString,
  } satisfies PersistedStateSpec<TimerToolMode>,
  locale: {
    key: TIMER_LOCALE_KEY,
    fallback: () => DEFAULT_LOCALE,
    parse: (stored: string) => (isLocale(stored) ? stored : DEFAULT_LOCALE),
    serialize: serializeString,
  } satisfies PersistedStateSpec<Locale>,
  statsPanelOpen: {
    key: STATS_PANEL_OPEN_KEY,
    fallback: () => false,
    parse: (stored: string) => readStoredBoolean(stored, false),
    serialize: serializeBoolean,
  } satisfies PersistedStateSpec<boolean>,
  appView: {
    key: APP_VIEW_KEY,
    fallback: () => 'timer' as AppViewMode,
    parse: (stored: string) => (isAppViewMode(stored) ? stored : 'timer'),
    serialize: serializeString,
  } satisfies PersistedStateSpec<AppViewMode>,
  trainingProgram: {
    key: TRAINING_PROGRAM_KEY,
    fallback: () => DEFAULT_PROGRAM,
    parse: (stored: string) => sanitizeTrainingProgram(JSON.parse(stored)),
  } satisfies PersistedStateSpec<TrainingProgram>,
  planSectionVisibility: {
    key: PLAN_SECTION_VISIBILITY_KEY,
    fallback: () => DEFAULT_SECTION_VISIBILITY,
    parse: (stored: string) => sanitizeSectionVisibility(JSON.parse(stored)),
  } satisfies PersistedStateSpec<SectionVisibility>,
};
