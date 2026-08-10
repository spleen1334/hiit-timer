import type { Messages } from '../../i18n';
import type { SessionTotals } from '../../timer/types';
import { CollapsiblePanel } from '../shared/CollapsiblePanel';
import { InsightsIcon } from '../shared/icons';
import { SessionBreakdownCard } from './SessionBreakdownCard';

type StatsPanelProps = {
  messages: Messages;
  isOpen: boolean;
  sessionTotals: SessionTotals;
  onToggleOpen: () => void;
};

export function StatsPanel({
  messages,
  isOpen,
  sessionTotals,
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
        </div>
      </CollapsiblePanel>
    </div>
  );
}
