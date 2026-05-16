import type { Phase } from '../../timer/types';

export function TimerCard({
  phase,
  isWarning,
  phaseProgress,
  label,
  secondsLeft,
}: {
  phase: Phase;
  isWarning: boolean;
  phaseProgress: number;
  label: string;
  secondsLeft: number;
}) {
  return (
    <div className={`timer-card timer-card-${phase} ${isWarning ? 'timer-card-warning' : ''}`}>
      <div className="timer-card-progress" aria-hidden="true">
        <div className="timer-card-progress-fill" style={{ transform: `scaleX(${phaseProgress})` }} />
      </div>
      <div className="timer-card-content">
        <p className="phase-name">{label}</p>
        <div className="countdown">{secondsLeft}</div>
      </div>
    </div>
  );
}
