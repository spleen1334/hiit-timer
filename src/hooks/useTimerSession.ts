import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_HISTORY, TICK_MS } from '../timer/constants';
import { getPhaseProgress, getRoundProgress, getSessionTotals } from '../timer/math';
import type { HistoryEntry, Phase, SessionMode, TimerSettings } from '../timer/types';

type TimerFeedback = {
  ensureAudioContext: () => Promise<void>;
  notifyTransition: (nextPhase: Phase) => void;
  playCountdownTone: (secondsLeft: number) => void;
};

type UseTimerSessionOptions = {
  settings: TimerSettings;
  onComplete: (updater: (current: HistoryEntry[]) => HistoryEntry[]) => void;
  feedback: TimerFeedback;
};

export function useTimerSession({ settings, onComplete, feedback }: UseTimerSessionOptions) {
  const [mode, setMode] = useState<SessionMode>('setup');
  const [phase, setPhase] = useState<Phase>('delay');
  const [round, setRound] = useState(1);
  const [phaseDuration, setPhaseDuration] = useState(settings.initialDelay);
  const [remainingMs, setRemainingMs] = useState(settings.initialDelay * 1000);

  const settingsRef = useRef(settings);
  const phaseRef = useRef<Phase>('delay');
  const roundRef = useRef(1);
  const deadlineRef = useRef<number | null>(null);
  const remainingMsRef = useRef(settings.initialDelay * 1000);
  const wholeSecondsRef = useRef<number | null>(null);
  const feedbackRef = useRef(feedback);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    remainingMsRef.current = remainingMs;
  }, [remainingMs]);

  const applyPhaseState = useCallback((nextPhase: Phase, nextRound: number, durationSeconds: number) => {
    phaseRef.current = nextPhase;
    roundRef.current = nextRound;
    remainingMsRef.current = durationSeconds * 1000;
    deadlineRef.current = Date.now() + durationSeconds * 1000;
    wholeSecondsRef.current = durationSeconds;

    setPhase(nextPhase);
    setRound(nextRound);
    setPhaseDuration(durationSeconds);
    setRemainingMs(durationSeconds * 1000);
  }, []);

  const finishSession = useCallback(() => {
    const completedSettings = settingsRef.current;
    const totals = getSessionTotals(completedSettings);

    deadlineRef.current = null;
    phaseRef.current = 'complete';
    wholeSecondsRef.current = 0;
    onComplete((current) =>
      [
        {
          completedAt: new Date().toISOString(),
          ...totals,
          settings: completedSettings,
        },
        ...current,
      ].slice(0, MAX_HISTORY),
    );
    setMode('complete');
    setPhase('complete');
    setRemainingMs(0);
    setPhaseDuration(0);
    feedbackRef.current.notifyTransition('complete');
  }, [onComplete]);

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current;
    const currentRound = roundRef.current;
    const currentSettings = settingsRef.current;

    if (currentPhase === 'delay') {
      applyPhaseState('active', 1, currentSettings.activeSeconds);
      feedbackRef.current.notifyTransition('active');
      return;
    }

    if (currentPhase === 'active') {
      if (currentRound >= currentSettings.rounds) {
        finishSession();
        return;
      }

      applyPhaseState('rest', currentRound, currentSettings.restSeconds);
      feedbackRef.current.notifyTransition('rest');
      return;
    }

    if (currentPhase === 'rest') {
      const nextRound = currentRound + 1;
      applyPhaseState('active', nextRound, currentSettings.activeSeconds);
      feedbackRef.current.notifyTransition('active');
    }
  }, [applyPhaseState, finishSession]);

  useEffect(() => {
    if (mode !== 'running') {
      return;
    }

    const tick = () => {
      if (!deadlineRef.current) {
        return;
      }

      const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(nextRemaining);

      const nextWholeSeconds = Math.ceil(nextRemaining / 1000);
      const lastWholeSeconds = wholeSecondsRef.current;

      if (
        lastWholeSeconds !== nextWholeSeconds &&
        nextWholeSeconds > 0 &&
        nextWholeSeconds <= 3 &&
        phaseRef.current !== 'complete'
      ) {
        feedbackRef.current.playCountdownTone(nextWholeSeconds);
      }

      wholeSecondsRef.current = nextWholeSeconds;

      if (nextRemaining <= 0) {
        advancePhase();
      }
    };

    tick();
    const interval = window.setInterval(tick, TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [advancePhase, mode]);

  const startSession = useCallback(async () => {
    await feedbackRef.current.ensureAudioContext();

    const currentSettings = settingsRef.current;
    const nextPhase = currentSettings.initialDelay > 0 ? 'delay' : 'active';
    const durationSeconds = nextPhase === 'delay' ? currentSettings.initialDelay : currentSettings.activeSeconds;

    setMode('running');
    applyPhaseState(nextPhase, 1, durationSeconds);

    if (nextPhase === 'active') {
      feedbackRef.current.notifyTransition('active');
    }
  }, [applyPhaseState]);

  const pauseSession = useCallback(() => {
    if (mode !== 'running' || !deadlineRef.current) {
      return;
    }

    const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
    deadlineRef.current = null;
    remainingMsRef.current = nextRemaining;
    setRemainingMs(nextRemaining);
    setMode('paused');
  }, [mode]);

  const resumeSession = useCallback(async () => {
    await feedbackRef.current.ensureAudioContext();
    deadlineRef.current = Date.now() + remainingMsRef.current;
    wholeSecondsRef.current = Math.ceil(remainingMsRef.current / 1000);
    setMode('running');
  }, []);

  const resetSession = useCallback(() => {
    const currentSettings = settingsRef.current;
    const nextPhase = currentSettings.initialDelay > 0 ? 'delay' : 'active';
    const nextDuration = nextPhase === 'delay' ? currentSettings.initialDelay : currentSettings.activeSeconds;

    deadlineRef.current = null;
    phaseRef.current = nextPhase;
    roundRef.current = 1;
    remainingMsRef.current = nextDuration * 1000;
    wholeSecondsRef.current = null;
    setMode('setup');
    setPhase(nextPhase);
    setPhaseDuration(nextDuration);
    setRemainingMs(nextDuration * 1000);
    setRound(1);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const phaseProgress = getPhaseProgress(remainingMs, phaseDuration);
  const roundProgress = getRoundProgress({
    mode,
    phase,
    phaseProgress,
    round,
    rounds: settings.rounds,
  });
  const isWarning = mode === 'running' && phase !== 'complete' && secondsLeft <= 3 && secondsLeft > 0;

  return {
    mode,
    phase,
    round,
    secondsLeft,
    phaseProgress,
    roundProgress,
    isWarning,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
  };
}
