import type { Messages } from '../../i18n';
import type { HistoryEntry, SessionTotals, TimerSettings } from '../../timer/types';
import { AppMark } from '../shared/AppMark';
import { SettingsPanel } from './SettingsPanel';
import { StatsPanel } from './StatsPanel';
import { Stepper } from './Stepper';

type SetupScreenProps = {
  messages: Messages;
  settings: TimerSettings;
  settingsOpen: boolean;
  statsOpen: boolean;
  localeLabel: string;
  isLocaleDialogOpen: boolean;
  canInstall: boolean;
  sessionTotals: SessionTotals;
  latestHistory: HistoryEntry | null;
  recentHistory: HistoryEntry[];
  maxHistorySeconds: number;
  dateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  onSettingChange: <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => void;
  onToggleSettings: () => void;
  onToggleStats: () => void;
  onOpenLocaleDialog: () => void;
  onInstall: () => void;
  onClearHistory: () => void;
  onStart: () => void;
};

export function SetupScreen({
  messages,
  settings,
  settingsOpen,
  statsOpen,
  localeLabel,
  isLocaleDialogOpen,
  canInstall,
  sessionTotals,
  latestHistory,
  recentHistory,
  maxHistorySeconds,
  dateFormatter,
  shortDateFormatter,
  onSettingChange,
  onToggleSettings,
  onToggleStats,
  onOpenLocaleDialog,
  onInstall,
  onClearHistory,
  onStart,
}: SetupScreenProps) {
  return (
    <section className="panel setup-panel">
      <div className="headline">
        <AppMark label={messages.appName} />
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
        <SettingsPanel
          messages={messages}
          settings={settings}
          isOpen={settingsOpen}
          localeLabel={localeLabel}
          isLocaleDialogOpen={isLocaleDialogOpen}
          canInstall={canInstall}
          onToggleOpen={onToggleSettings}
          onOpenLocaleDialog={onOpenLocaleDialog}
          onToggleSound={() => onSettingChange('soundEnabled', !settings.soundEnabled)}
          onInstall={onInstall}
          onClearHistory={onClearHistory}
        />

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
