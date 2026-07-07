import type { CSSProperties } from 'react';
import type { Phase } from '../../timer/types';
import type { TimerToolMode } from '../../timer/types';

export function TimerCard({
  timerTool,
  phase,
  isWarning,
  phaseProgress,
  label,
  secondsLeft,
  elapsedTime,
  elapsedMs,
  stopwatchState = 'setup',
}: {
  timerTool: TimerToolMode;
  phase?: Phase;
  isWarning?: boolean;
  phaseProgress?: number;
  label?: string;
  secondsLeft?: number;
  elapsedTime: string;
  elapsedMs: number;
  stopwatchState?: 'setup' | 'running' | 'paused' | 'complete';
}) {
  if (timerTool === 'stopwatch') {
    const handAngle = (elapsedMs / 1000) * 6;
    const stopwatchStatusClass =
      stopwatchState === 'running' ? 'is-running' : stopwatchState === 'paused' || stopwatchState === 'complete' ? 'is-paused' : 'is-ready';
    const stopwatchStyle = {
      ['--stopwatch-angle' as string]: `${handAngle}deg`,
    } as CSSProperties;

    return (
      <div
        className={`timer-card timer-card-stopwatch ${stopwatchStatusClass}`}
        style={stopwatchStyle}
      >
        <div className="stopwatch-card-shell" aria-hidden="true">
          <span className="stopwatch-card-orbit stopwatch-card-orbit-a" />
          <span className="stopwatch-card-orbit stopwatch-card-orbit-b" />
          <span className="stopwatch-card-dial" />
          <span className="stopwatch-card-hand" />
          <span className="stopwatch-card-hub" />
        </div>

        <div className="timer-card-content stopwatch-card-content">
          <div className="countdown stopwatch-countdown">{elapsedTime}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`timer-card timer-card-${phase ?? 'delay'} ${isWarning ? 'timer-card-warning' : ''}`}>
      <div className="timer-card-progress" aria-hidden="true">
        <div className="timer-card-progress-fill" style={{ transform: `scaleX(${phaseProgress ?? 0})` }} />
      </div>
      <div className="timer-card-content">
        <p className="phase-name">{label}</p>
        <div className="countdown">{secondsLeft}</div>
      </div>
    </div>
  );
}
