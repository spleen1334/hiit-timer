import type { Messages } from '../../i18n';
import type { HistoryEntry, SessionTotals } from '../../timer/types';
import { CollapsiblePanel } from '../shared/CollapsiblePanel';
import { InsightsIcon } from '../shared/icons';
import { HistoryCard } from './HistoryCard';
import { SessionBreakdownCard } from './SessionBreakdownCard';

type StatsPanelProps = {
  messages: Messages;
  isOpen: boolean;
  sessionTotals: SessionTotals;
  latestHistory: HistoryEntry | null;
  recentHistory: HistoryEntry[];
  maxHistorySeconds: number;
  dateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  onToggleOpen: () => void;
};

export function StatsPanel({
  messages,
  isOpen,
  sessionTotals,
  latestHistory,
  recentHistory,
  maxHistorySeconds,
  dateFormatter,
  shortDateFormatter,
  onToggleOpen,
}: StatsPanelProps) {
  return (
    <div className="panel-section">
      <button
        type="button"
        className={`panel-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-controls="stats-panel"
      >
        <span className="panel-toggle-icon-wrap">
          <InsightsIcon />
        </span>
        <span>{messages.statsLabel}</span>
        <span className="panel-toggle-chevron" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <CollapsiblePanel id="stats-panel" isOpen={isOpen}>
        <div className="insights-grid">
          <SessionBreakdownCard messages={messages} sessionTotals={sessionTotals} />
          <HistoryCard
            messages={messages}
            latestHistory={latestHistory}
            recentHistory={recentHistory}
            maxHistorySeconds={maxHistorySeconds}
            dateFormatter={dateFormatter}
            shortDateFormatter={shortDateFormatter}
          />
        </div>
      </CollapsiblePanel>
    </div>
  );
}
