import { useCallback, useEffect, useRef, useState } from 'react';

export function useStopwatchSession() {
  const [mode, setMode] = useState<'setup' | 'running' | 'paused'>('setup');
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);

  useEffect(() => {
    if (mode !== 'running') {
      return;
    }

    let frame = 0;

    const tick = () => {
      if (startedAtRef.current == null) {
        return;
      }

      const nextElapsed = accumulatedMsRef.current + (performance.now() - startedAtRef.current);
      setElapsedMs(nextElapsed);
      frame = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [mode]);

  const startSession = useCallback(() => {
    accumulatedMsRef.current = 0;
    startedAtRef.current = performance.now();
    setElapsedMs(0);
    setMode('running');
  }, []);

  const pauseSession = useCallback(() => {
    if (mode !== 'running' || startedAtRef.current == null) {
      return;
    }

    const nextElapsed = accumulatedMsRef.current + (performance.now() - startedAtRef.current);
    startedAtRef.current = null;
    accumulatedMsRef.current = nextElapsed;
    setElapsedMs(nextElapsed);
    setMode('paused');
  }, [mode]);

  const resumeSession = useCallback(() => {
    if (mode !== 'paused') {
      return;
    }

    startedAtRef.current = performance.now();
    setMode('running');
  }, [mode]);

  const resetSession = useCallback(() => {
    startedAtRef.current = null;
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setMode('setup');
  }, []);

  return {
    mode,
    elapsedMs,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
  };
}
