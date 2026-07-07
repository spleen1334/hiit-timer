import { TimerStackIcon } from '../shared/icons';

export function RunMeta({
  kicker,
  roundLabel,
  roundProgress,
}: {
  kicker: string;
  roundLabel: string;
  roundProgress: number;
}) {
  return (
    <div className="run-meta">
      <div className="run-meta-main">
        <div className="run-meta-copy">
          <p className="eyebrow">{kicker}</p>
          <div className="round-progress" aria-hidden="true">
            <div className="round-progress-fill" style={{ transform: `scaleX(${roundProgress})` }} />
          </div>
        </div>
        <div className="run-meta-mark" aria-hidden="true">
          <span className="run-meta-ring run-meta-ring-a" />
          <span className="run-meta-ring run-meta-ring-b" />
          <span className="run-meta-ring run-meta-ring-c" />
          <span className="run-meta-icon-shell">
            <TimerStackIcon />
          </span>
        </div>
      </div>
      <p className="round-pill">{roundLabel}</p>
    </div>
  );
}
