import { useEffect } from 'react';
import type { Phase, SessionMode, TimerToolMode } from '../timer/types';

export function useThemeColor(timerTool: TimerToolMode, mode: SessionMode, phase: Phase) {
  useEffect(() => {
    const themeColor = (() => {
      if (timerTool === 'stopwatch') {
        return '#083344';
      }

      if (mode === 'setup') {
        return '#111827';
      }

      if (phase === 'active') {
        return '#991b1b';
      }

      if (phase === 'rest') {
        return '#166534';
      }

      if (phase === 'complete') {
        return '#1e293b';
      }

      return '#172554';
    })();

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }, [timerTool, mode, phase]);
}
