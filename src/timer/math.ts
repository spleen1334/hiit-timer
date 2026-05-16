import { DEFAULT_SETTINGS, MAX_HISTORY } from './constants';
import type { HistoryEntry, Phase, SessionMode, SessionTotals, TimerSettings } from './types';

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const readStoredBoolean = (stored: string, fallback: boolean) => {
  if (stored === 'true') {
    return true;
  }

  if (stored === 'false') {
    return false;
  }

  return fallback;
};

export const sanitizeSettings = (settings: Partial<TimerSettings> | TimerSettings): TimerSettings => ({
  activeSeconds: clamp(Number(settings.activeSeconds ?? DEFAULT_SETTINGS.activeSeconds), 1, 120),
  restSeconds: clamp(Number(settings.restSeconds ?? DEFAULT_SETTINGS.restSeconds), 1, 120),
  rounds: clamp(Number(settings.rounds ?? DEFAULT_SETTINGS.rounds), 1, 20),
  initialDelay: clamp(Number(settings.initialDelay ?? DEFAULT_SETTINGS.initialDelay), 0, 60),
  soundEnabled: Boolean(settings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled),
});

export const sanitizeHistory = (entries: unknown): HistoryEntry[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as Partial<HistoryEntry>;

      return {
        completedAt: String(candidate.completedAt ?? new Date().toISOString()),
        totalSeconds: Math.max(1, Number(candidate.totalSeconds ?? 1)),
        workSeconds: Math.max(0, Number(candidate.workSeconds ?? 0)),
        restSeconds: Math.max(0, Number(candidate.restSeconds ?? 0)),
        delaySeconds: Math.max(0, Number(candidate.delaySeconds ?? 0)),
        settings: sanitizeSettings(candidate.settings ?? DEFAULT_SETTINGS),
      };
    })
    .filter((entry): entry is HistoryEntry => entry !== null)
    .slice(0, MAX_HISTORY);
};

export const getSessionTotals = (settings: TimerSettings): SessionTotals => {
  const workSeconds = settings.activeSeconds * settings.rounds;
  const restSeconds = settings.restSeconds * Math.max(0, settings.rounds - 1);
  const delaySeconds = settings.initialDelay;
  const totalSeconds = workSeconds + restSeconds + delaySeconds;

  return { workSeconds, restSeconds, delaySeconds, totalSeconds };
};

export const getPhaseProgress = (remainingMs: number, phaseDuration: number) =>
  phaseDuration > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / (phaseDuration * 1000))) : 1;

export const getRoundProgress = ({
  mode,
  phase,
  phaseProgress,
  round,
  rounds,
}: {
  mode: SessionMode;
  phase: Phase;
  phaseProgress: number;
  round: number;
  rounds: number;
}) => {
  if (phase === 'complete' || mode === 'complete') {
    return 1;
  }

  if (phase === 'delay') {
    return 0;
  }

  if (phase === 'rest') {
    return Math.min(1, round / rounds);
  }

  return Math.min(1, (round - 1 + phaseProgress) / rounds);
};

export const formatClockDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
