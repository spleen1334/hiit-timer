import { useEffect, useRef } from 'react';
import { canRequestWakeLock } from '../timer/platform';
import type { SessionMode } from '../timer/types';

export function useWakeLock(mode: SessionMode) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const syncWakeLock = async () => {
      if (!canRequestWakeLock()) {
        return;
      }

      if (mode === 'running') {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
          wakeLockRef.current = null;
        }
        return;
      }

      if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => undefined);
        wakeLockRef.current = null;
      }
    };

    void syncWakeLock();

    return () => {
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => undefined);
        wakeLockRef.current = null;
      }
    };
  }, [mode]);
}
