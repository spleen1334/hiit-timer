import { useCallback, useEffect, useRef } from 'react';
import { canVibrate } from '../timer/platform';
import type { Phase, TimerSettings } from '../timer/types';

export function useAudioFeedback(settings: TimerSettings) {
  const settingsRef = useRef(settings);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === 'undefined' || !('AudioContext' in window)) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback((frequency: number, durationSeconds: number, gainValue: number) => {
    if (!settingsRef.current.soundEnabled) {
      return;
    }

    const audioContext = audioContextRef.current;

    if (!audioContext) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSeconds);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + durationSeconds + 0.02);
  }, []);

  const playCountdownTone = useCallback(
    (secondsLeft: number) => {
      playTone(secondsLeft === 1 ? 1046.5 : 880, 0.09, 0.05);
    },
    [playTone],
  );

  const notifyTransition = useCallback(
    (nextPhase: Phase) => {
      if (settingsRef.current.soundEnabled) {
        if (nextPhase === 'active') {
          playTone(659.25, 0.16, 0.08);
          window.setTimeout(() => playTone(783.99, 0.16, 0.07), 100);
        } else if (nextPhase === 'rest') {
          playTone(523.25, 0.18, 0.08);
        } else if (nextPhase === 'complete') {
          playTone(783.99, 0.16, 0.08);
          window.setTimeout(() => playTone(987.77, 0.2, 0.07), 120);
        }
      }

      if (canVibrate()) {
        navigator.vibrate(nextPhase === 'complete' ? [120, 60, 180] : 80);
      }
    },
    [playTone],
  );

  return { ensureAudioContext, notifyTransition, playCountdownTone };
}
