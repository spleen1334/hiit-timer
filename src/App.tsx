import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlanScreen } from './components/plan/PlanScreen';
import { RunScreen } from './components/run/RunScreen';
import { SetupScreen } from './components/setup/SetupScreen';
import { ModeTabs } from './components/shared/ModeTabs';
import { OrientationLock } from './components/shared/OrientationLock';
import { SuccessOverlay } from './components/shared/SuccessOverlay';
import { ConfirmDialog, InfoDialog, LocaleDialog } from './components/shared/dialogs';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { usePersistentState } from './hooks/usePersistentState';
import { useThemeColor } from './hooks/useThemeColor';
import { useTimerSession } from './hooks/useTimerSession';
import { useWakeLock } from './hooks/useWakeLock';
import { DEFAULT_LOCALE, LOCALE_OPTIONS, MESSAGES, isLocale, type Locale } from './i18n';
import { APP_VIEW_KEY, TRAINING_PROGRAM_KEY } from './plan/constants';
import { DEFAULT_PROGRAM } from './plan/defaultProgram';
import type { AppViewMode, TrainingProgram } from './plan/types';
import { sanitizeTrainingProgram } from './plan/utils';
import {
  DEFAULT_SETTINGS,
  HISTORY_KEY,
  LOCALE_KEY,
  SETTINGS_KEY,
  SETTINGS_PANEL_KEY,
  STATS_PANEL_KEY,
} from './timer/constants';
import { getSessionTotals, readStoredBoolean, sanitizeHistory, sanitizeSettings } from './timer/math';
import type { Phase, TimerSettings } from './timer/types';

const serializeString = (value: string) => value;
const serializeBoolean = (value: boolean) => String(value);
const isAppViewMode = (value: string): value is AppViewMode => value === 'timer' || value === 'plan';

function App() {
  const [settings, setSettings] = usePersistentState<TimerSettings>(
    SETTINGS_KEY,
    () => sanitizeSettings(DEFAULT_SETTINGS),
    {
      parse: (stored) => sanitizeSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }),
    },
  );
  const [locale, setLocale] = usePersistentState<Locale>(LOCALE_KEY, () => DEFAULT_LOCALE, {
    parse: (stored) => (isLocale(stored) ? stored : DEFAULT_LOCALE),
    serialize: serializeString,
  });
  const [history, setHistory] = usePersistentState(HISTORY_KEY, () => [], {
    parse: (stored) => sanitizeHistory(JSON.parse(stored)),
  });
  const [settingsOpen, setSettingsOpen] = usePersistentState(SETTINGS_PANEL_KEY, () => false, {
    parse: (stored) => readStoredBoolean(stored, false),
    serialize: serializeBoolean,
  });
  const [statsOpen, setStatsOpen] = usePersistentState(STATS_PANEL_KEY, () => false, {
    parse: (stored) => readStoredBoolean(stored, false),
    serialize: serializeBoolean,
  });
  const [appView, setAppView] = usePersistentState<AppViewMode>(APP_VIEW_KEY, () => 'timer', {
    parse: (stored) => (isAppViewMode(stored) ? stored : 'timer'),
    serialize: serializeString,
  });
  const [trainingProgram, setTrainingProgram] = usePersistentState<TrainingProgram>(
    TRAINING_PROGRAM_KEY,
    () => DEFAULT_PROGRAM,
    {
      parse: (stored) => sanitizeTrainingProgram(JSON.parse(stored)),
    },
  );
  const [isLocaleDialogOpen, setIsLocaleDialogOpen] = useState(false);
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

  const feedback = useAudioFeedback(settings);
  const {
    mode,
    phase,
    round,
    secondsLeft,
    phaseProgress,
    roundProgress,
    isWarning,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
  } = useTimerSession({
    settings,
    onComplete: setHistory,
    feedback,
  });
  const { canInstall, requestInstall } = useInstallPrompt({
    onFallbackPrompt: useCallback(() => setIsInstallDialogOpen(true), []),
  });

  useWakeLock(mode);
  useThemeColor(mode, phase);

  useEffect(() => {
    if (settingsOpen) {
      return;
    }

    setIsLocaleDialogOpen(false);
    setIsInstallDialogOpen(false);
  }, [settingsOpen]);

  const messages = MESSAGES[locale];
  const localeMeta = LOCALE_OPTIONS.find((option) => option.id === locale) ?? LOCALE_OPTIONS[0];
  const sessionTotals = useMemo(() => getSessionTotals(settings), [settings]);
  const latestHistory = history[0] ?? null;
  const recentHistory = history.slice(0, 6).reverse();
  const maxHistorySeconds = Math.max(...recentHistory.map((entry) => entry.totalSeconds), 1);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeMeta.intl, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [localeMeta.intl],
  );
  const shortDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeMeta.intl, {
        month: 'numeric',
        day: 'numeric',
      }),
    [localeMeta.intl],
  );
  const timerScreenTone = useMemo(() => {
    if (mode === 'setup') {
      return 'screen-setup';
    }

    if (phase === 'active') {
      return 'screen-active';
    }

    if (phase === 'rest') {
      return 'screen-rest';
    }

    if (phase === 'complete') {
      return 'screen-complete';
    }

    return 'screen-delay';
  }, [mode, phase]);
  const screenTone = appView === 'plan' ? 'screen-plan' : timerScreenTone;
  const phaseCopy: Record<Exclude<Phase, 'complete'>, { title: string; kicker: string }> = {
    delay: { title: messages.phaseDelayTitle, kicker: messages.phaseDelayKicker },
    active: { title: messages.phaseActiveTitle, kicker: messages.phaseActiveKicker },
    rest: { title: messages.phaseRestTitle, kicker: messages.phaseRestKicker },
  };
  const runningLabel = phase === 'complete' ? messages.phaseDoneTitle : phaseCopy[phase].title;
  const runningKicker = phase === 'complete' ? messages.phaseDoneKicker : phaseCopy[phase].kicker;
  const showModeTabs = !(appView === 'timer' && mode !== 'setup');

  const updateSetting = useCallback(
    <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => {
      setSettings((current) => sanitizeSettings({ ...current, [key]: next }));
    },
    [setSettings],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setIsClearHistoryDialogOpen(false);
  }, [setHistory]);

  return (
    <main className={`app-shell ${screenTone} ${appView === 'timer' && isWarning ? 'screen-warning' : ''}`}>
      <OrientationLock label={messages.portraitModeLabel} />

      <div className={`app-content ${appView === 'timer' && mode === 'complete' ? 'app-content-success' : ''}`}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {appView === 'timer' && isWarning ? <div className={`warning-overlay warning-overlay-${phase}`} aria-hidden="true" /> : null}

        {showModeTabs ? (
          <ModeTabs
            timerLabel={messages.timerTabLabel}
            planLabel={messages.planTabLabel}
            value={appView}
            onChange={setAppView}
          />
        ) : null}

        <div key={appView} className="view-stage">
          {appView === 'plan' ? (
            <PlanScreen messages={messages} program={trainingProgram} onProgramChange={setTrainingProgram} />
          ) : mode === 'setup' ? (
            <SetupScreen
              messages={messages}
              settings={settings}
              settingsOpen={settingsOpen}
              statsOpen={statsOpen}
              localeLabel={localeMeta.label}
              isLocaleDialogOpen={isLocaleDialogOpen}
              canInstall={canInstall}
              sessionTotals={sessionTotals}
              latestHistory={latestHistory}
              recentHistory={recentHistory}
              maxHistorySeconds={maxHistorySeconds}
              dateFormatter={dateFormatter}
              shortDateFormatter={shortDateFormatter}
              onSettingChange={updateSetting}
              onToggleSettings={() => setSettingsOpen((current) => !current)}
              onToggleStats={() => setStatsOpen((current) => !current)}
              onOpenLocaleDialog={() => setIsLocaleDialogOpen(true)}
              onInstall={() => void requestInstall()}
              onClearHistory={() => setIsClearHistoryDialogOpen(true)}
              onStart={() => void startSession()}
            />
          ) : (
            <RunScreen
              messages={messages}
              mode={mode}
              phase={phase}
              round={round}
              rounds={settings.rounds}
              secondsLeft={secondsLeft}
              phaseProgress={phaseProgress}
              roundProgress={roundProgress}
              isWarning={isWarning}
              runningLabel={runningLabel}
              runningKicker={runningKicker}
              onPause={pauseSession}
              onResume={() => void resumeSession()}
              onRestart={() => void startSession()}
              onStop={resetSession}
            />
          )}
        </div>
      </div>

      {appView === 'timer' && mode === 'complete' ? <SuccessOverlay onDismiss={resetSession} returnLabel={messages.returnHomeLabel} /> : null}
      {isClearHistoryDialogOpen ? (
        <ConfirmDialog
          title={messages.clearHistoryTitle}
          body={messages.clearHistoryConfirm}
          cancelLabel={messages.cancelLabel}
          confirmLabel={messages.confirmLabel}
          onCancel={() => setIsClearHistoryDialogOpen(false)}
          onConfirm={clearHistory}
        />
      ) : null}
      {isInstallDialogOpen ? (
        <InfoDialog
          title={messages.installAppTitle}
          body={messages.installAppBody}
          closeLabel={messages.cancelLabel}
          onClose={() => setIsInstallDialogOpen(false)}
        />
      ) : null}
      {isLocaleDialogOpen ? (
        <LocaleDialog
          title={messages.languageLabel}
          cancelLabel={messages.cancelLabel}
          selectedLocale={locale}
          onClose={() => setIsLocaleDialogOpen(false)}
          onSelect={(nextLocale) => {
            setLocale(nextLocale);
            setIsLocaleDialogOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}

export default App;
