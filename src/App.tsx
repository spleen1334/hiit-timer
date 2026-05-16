import { useCallback, useEffect, useMemo, useState } from 'react';
import { RunScreen } from './components/run/RunScreen';
import { SetupScreen } from './components/setup/SetupScreen';
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
  const screenTone = useMemo(() => {
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
  const phaseCopy: Record<Exclude<Phase, 'complete'>, { title: string; kicker: string }> = {
    delay: { title: messages.phaseDelayTitle, kicker: messages.phaseDelayKicker },
    active: { title: messages.phaseActiveTitle, kicker: messages.phaseActiveKicker },
    rest: { title: messages.phaseRestTitle, kicker: messages.phaseRestKicker },
  };
  const runningLabel = phase === 'complete' ? messages.phaseDoneTitle : phaseCopy[phase].title;
  const runningKicker = phase === 'complete' ? messages.phaseDoneKicker : phaseCopy[phase].kicker;

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
    <main className={`app-shell ${screenTone} ${isWarning ? 'screen-warning' : ''}`}>
      <OrientationLock label={messages.portraitModeLabel} />

      <div className={`app-content ${mode === 'complete' ? 'app-content-success' : ''}`}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {isWarning ? <div className={`warning-overlay warning-overlay-${phase}`} aria-hidden="true" /> : null}

        {mode === 'setup' ? (
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

      {mode === 'complete' ? <SuccessOverlay onDismiss={resetSession} returnLabel={messages.returnHomeLabel} /> : null}
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
