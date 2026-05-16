import type { Messages } from '../../i18n';
import { formatClockDuration } from '../../timer/math';
import type { HistoryEntry } from '../../timer/types';
import { HistoryIcon } from '../shared/icons';

type HistoryCardProps = {
  messages: Messages;
  latestHistory: HistoryEntry | null;
  recentHistory: HistoryEntry[];
  maxHistorySeconds: number;
  dateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
};

export function HistoryCard({
  messages,
  latestHistory,
  recentHistory,
  maxHistorySeconds,
  dateFormatter,
  shortDateFormatter,
}: HistoryCardProps) {
  return (
    <section className="info-card">
      <div className="info-card-head">
        <div className="info-card-title">
          <span className="info-card-icon" aria-hidden="true">
            <HistoryIcon />
          </span>
          <div>
            <p className="info-card-label">{messages.historyTitle}</p>
            <strong>{latestHistory ? formatClockDuration(latestHistory.totalSeconds) : '--:--'}</strong>
          </div>
        </div>
      </div>

      {latestHistory ? (
        <>
          <div className="history-meta">
            <div>
              <p className="summary-label">{messages.latestSuccessLabel}</p>
              <strong>{dateFormatter.format(new Date(latestHistory.completedAt))}</strong>
            </div>
            <div>
              <p className="summary-label">{messages.settingsUsedLabel}</p>
              <div className="history-settings">
                <span>
                  {messages.activeLabel} {latestHistory.settings.activeSeconds}
                </span>
                <span>
                  {messages.restLabel} {latestHistory.settings.restSeconds}
                </span>
                <span>
                  {messages.roundsLabel} {latestHistory.settings.rounds}
                </span>
                <span>
                  {messages.delayLabel} {latestHistory.settings.initialDelay}
                </span>
              </div>
            </div>
          </div>

          <div className="history-chart" aria-label={messages.recentRunsLabel}>
            {recentHistory.map((entry) => (
              <div key={entry.completedAt} className="history-bar-wrap">
                <div
                  className="history-bar"
                  style={{
                    height: `${Math.max(18, (entry.totalSeconds / maxHistorySeconds) * 100)}%`,
                  }}
                />
                <span>{shortDateFormatter.format(new Date(entry.completedAt))}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="empty-state">{messages.noHistoryLabel}</p>
      )}
    </section>
  );
}
