import type { Messages } from '../../i18n';
import { formatStopwatchTime } from '../../timer/math';
import type { SessionMode, SessionTotals, TimerSettings, TimerToolMode } from '../../timer/types';
import { RunControls } from '../run/RunControls';
import { TimerCard } from '../run/TimerCard';
import { PlayIcon, RestartIcon, StopwatchIcon, TimerStackIcon } from '../shared/icons';
import { StatsPanel } from './StatsPanel';
import { Stepper } from './Stepper';

type SetupScreenProps = {
  messages: Messages;
  timerTool: TimerToolMode;
  settings: TimerSettings;
  statsOpen: boolean;
  sessionTotals: SessionTotals;
  stopwatchMode: SessionMode;
  stopwatchElapsedMs: number;
  onSettingChange: <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => void;
  onToggleStats: () => void;
  onToolChange: (next: TimerToolMode) => void;
  onStart: () => void;
  onStopwatchPause: () => void;
  onStopwatchResume: () => void;
  onStopwatchReset: () => void;
};

export function SetupScreen({
  messages,
  timerTool,
  settings,
  statsOpen,
  sessionTotals,
  stopwatchMode,
  stopwatchElapsedMs,
  onSettingChange,
  onToggleStats,
  onToolChange,
  onStart,
  onStopwatchPause,
  onStopwatchResume,
  onStopwatchReset,
}: SetupScreenProps) {
  const isHiitMode = timerTool === 'hiit';
  const isStopwatchActive = stopwatchMode !== 'setup';
  const stopwatchTime = formatStopwatchTime(stopwatchElapsedMs);

  return (
    <section className={`panel setup-panel ${isHiitMode ? '' : `setup-panel-stopwatch ${isStopwatchActive ? 'setup-panel-stopwatch-active' : ''}`}`}>
      {isHiitMode ? (
        <>
          <div className="headline mode-headline">
              <div className="mode-header-copy">
                <p className="screen-hero-kicker">{messages.timerTabLabel}</p>
                <h1>{messages.timerHeaderTitle}</h1>
              </div>
          </div>

          <div className="timer-tool-switch" role="tablist" aria-label={messages.timerTabLabel}>
            <button
              type="button"
              className={`timer-tool-tab ${isHiitMode ? 'is-active' : ''}`}
              aria-selected={isHiitMode}
              role="tab"
              onClick={() => onToolChange('hiit')}
            >
              <TimerStackIcon />
              <span>{messages.hiitTimerLabel}</span>
            </button>
            <button
              type="button"
              className={`timer-tool-tab ${!isHiitMode ? 'is-active' : ''}`}
              aria-selected={!isHiitMode}
              role="tab"
              onClick={() => onToolChange('stopwatch')}
            >
              <StopwatchIcon />
              <span>{messages.stopwatchLabel}</span>
            </button>
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
              onToggleOpen={onToggleStats}
            />
          </div>

          <button type="button" className="primary-button" onClick={onStart}>
            {messages.startTimer}
          </button>
        </>
      ) : (
        <>
          <div className="headline mode-headline">
              <div className="mode-header-copy">
                <p className="screen-hero-kicker">{messages.timerTabLabel}</p>
                <h1>{messages.stopwatchHeaderTitle}</h1>
              </div>
          </div>

          <div className="timer-tool-switch" role="tablist" aria-label={messages.timerTabLabel}>
              <button
                type="button"
                className={`timer-tool-tab ${isHiitMode ? 'is-active' : ''}`}
                aria-selected={isHiitMode}
                role="tab"
                onClick={() => onToolChange('hiit')}
                disabled={stopwatchMode !== 'setup'}
              >
                <TimerStackIcon />
                <span>{messages.hiitTimerLabel}</span>
              </button>
              <button
                type="button"
                className={`timer-tool-tab ${!isHiitMode ? 'is-active' : ''}`}
                aria-selected={!isHiitMode}
                role="tab"
                onClick={() => onToolChange('stopwatch')}
              >
                <StopwatchIcon />
                <span>{messages.stopwatchLabel}</span>
              </button>
          </div>

          <TimerCard
            timerTool="stopwatch"
            elapsedTime={stopwatchTime}
            elapsedMs={stopwatchElapsedMs}
            stopwatchState={stopwatchMode}
          />

          {stopwatchMode === 'setup' ? (
            <div className="run-controls stopwatch-inline-controls">
              <button type="button" className="primary-button action-button" onClick={onStart}>
                <PlayIcon />
                {messages.startStopwatch}
              </button>
              <button
                type="button"
                className="ghost-button action-button action-button-danger action-button-icon-only"
                onClick={onStopwatchReset}
                aria-label={messages.resetLabel}
                title={messages.resetLabel}
                disabled
              >
                <RestartIcon />
              </button>
            </div>
          ) : (
            <RunControls
              messages={messages}
              timerTool="stopwatch"
              mode={stopwatchMode}
              onPause={onStopwatchPause}
              onResume={onStopwatchResume}
              onRestart={onStopwatchReset}
              onReset={onStopwatchReset}
              onStop={onStopwatchReset}
            />
          )}

          <div className="stopwatch-echo" aria-hidden="true">
            <span className="stopwatch-echo-glow" />
            <span className="stopwatch-echo-ring stopwatch-echo-ring-a" />
            <span className="stopwatch-echo-ring stopwatch-echo-ring-b" />
            <span className="stopwatch-echo-ring stopwatch-echo-ring-c" />
            <span className="stopwatch-echo-core" />
          </div>
        </>
      )}
    </section>
  );
}
