import type { Messages } from '../../i18n';
import type { HistoryEntry, SessionTotals, TimerSettings } from '../../timer/types';
import { PauseIcon, PlayIcon, TimerStackIcon } from '../shared/icons';
import { StatsPanel } from './StatsPanel';
import { Stepper } from './Stepper';

type SetupScreenProps = {
  messages: Messages;
  settings: TimerSettings;
  statsOpen: boolean;
  sessionTotals: SessionTotals;
  latestHistory: HistoryEntry | null;
  recentHistory: HistoryEntry[];
  maxHistorySeconds: number;
  dateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  onSettingChange: <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => void;
  onToggleStats: () => void;
  onStart: () => void;
};

export function SetupScreen({
  messages,
  settings,
  statsOpen,
  sessionTotals,
  latestHistory,
  recentHistory,
  maxHistorySeconds,
  dateFormatter,
  shortDateFormatter,
  onSettingChange,
  onToggleStats,
  onStart,
}: SetupScreenProps) {
  return (
    <section className="panel setup-panel">
      <div className="headline setup-headline">
        <div className="setup-header-main">
          <div className="setup-header-copy">
            <p className="screen-hero-kicker">{messages.timerTabLabel}</p>
            <h1>{messages.timerHeaderTitle}</h1>
            <p>{messages.timerHeaderSubtitle}</p>
          </div>

          <div className="setup-header-mark" aria-hidden="true">
            <span className="setup-header-ring setup-header-ring-a" />
            <span className="setup-header-ring setup-header-ring-b" />
            <span className="setup-header-ring setup-header-ring-c" />
            <span className="setup-header-icon">
              <TimerStackIcon />
            </span>
          </div>
        </div>

        <div className="setup-header-badges" aria-hidden="true">
          <span className="setup-header-chip">
            <PlayIcon />
            <span>{messages.activeLabel}</span>
          </span>
          <span className="setup-header-chip">
            <PauseIcon />
            <span>{messages.restLabel}</span>
          </span>
          <span className="setup-header-chip">
            <TimerStackIcon />
            <span>{messages.roundsLabel}</span>
          </span>
        </div>
      </div>

      <div className="stepper-grid">
        <Stepper
          label={messages.activeLabel}
          value={settings.activeSeconds}
          min={1}
          max={120}
          tint="red"
          unit={messages.secondsUnit}
          onChange={(next) => onSettingChange('activeSeconds', next)}
        />
        <Stepper
          label={messages.restLabel}
          value={settings.restSeconds}
          min={1}
          max={120}
          tint="green"
          unit={messages.secondsUnit}
          onChange={(next) => onSettingChange('restSeconds', next)}
        />
        <Stepper
          label={messages.roundsLabel}
          value={settings.rounds}
          min={1}
          max={20}
          tint="gold"
          unit={messages.roundsUnit}
          onChange={(next) => onSettingChange('rounds', next)}
        />
        <Stepper
          label={messages.delayLabel}
          value={settings.initialDelay}
          min={0}
          max={60}
          tint="blue"
          unit={messages.secondsUnit}
          onChange={(next) => onSettingChange('initialDelay', next)}
        />
      </div>

      <div className="panel-toggle-row">
        <StatsPanel
          messages={messages}
          isOpen={statsOpen}
          sessionTotals={sessionTotals}
          latestHistory={latestHistory}
          recentHistory={recentHistory}
          maxHistorySeconds={maxHistorySeconds}
          dateFormatter={dateFormatter}
          shortDateFormatter={shortDateFormatter}
          onToggleOpen={onToggleStats}
        />
      </div>

      <button type="button" className="primary-button" onClick={onStart}>
        {messages.startTimer}
      </button>
    </section>
  );
}
