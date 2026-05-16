import type { Messages } from '../../i18n';
import { formatClockDuration } from '../../timer/math';
import type { SessionTotals } from '../../timer/types';
import { TimerStackIcon } from '../shared/icons';

export function SessionBreakdownCard({
  messages,
  sessionTotals,
}: {
  messages: Messages;
  sessionTotals: SessionTotals;
}) {
  return (
    <section className="info-card">
      <div className="info-card-head">
        <div className="info-card-title">
          <span className="info-card-icon" aria-hidden="true">
            <TimerStackIcon />
          </span>
          <div>
            <p className="info-card-label">{messages.sessionBreakdownTitle}</p>
            <strong>{formatClockDuration(sessionTotals.totalSeconds)}</strong>
          </div>
        </div>
      </div>

      <div className="session-graph" aria-hidden="true">
        <span className="session-graph-segment session-graph-delay" style={{ flexGrow: Math.max(sessionTotals.delaySeconds, 0) }} />
        <span className="session-graph-segment session-graph-work" style={{ flexGrow: Math.max(sessionTotals.workSeconds, 0) }} />
        <span className="session-graph-segment session-graph-rest" style={{ flexGrow: Math.max(sessionTotals.restSeconds, 0) }} />
      </div>

      <div className="session-stat-grid">
        <div>
          <p className="summary-label">{messages.totalDurationLabel}</p>
          <strong>{formatClockDuration(sessionTotals.totalSeconds)}</strong>
        </div>
        <div>
          <p className="summary-label">{messages.totalWorkLabel}</p>
          <strong>{formatClockDuration(sessionTotals.workSeconds)}</strong>
        </div>
        <div>
          <p className="summary-label">{messages.totalRestLabel}</p>
          <strong>{formatClockDuration(sessionTotals.restSeconds)}</strong>
        </div>
        <div>
          <p className="summary-label">{messages.totalDelayLabel}</p>
          <strong>{formatClockDuration(sessionTotals.delaySeconds)}</strong>
        </div>
      </div>
    </section>
  );
}
