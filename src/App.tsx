import { useCallback, useEffect, useMemo, useState } from 'react';
import { BodyScreen } from './components/body/BodyScreen';
import { PlanScreen } from './components/plan/PlanScreen';
import { RunScreen } from './components/run/RunScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { SetupScreen } from './components/setup/SetupScreen';
import { SplashScreen } from './components/shared/SplashScreen';
import { ModeTabs } from './components/shared/ModeTabs';
import { OrientationLock } from './components/shared/OrientationLock';
import { CogIcon } from './components/shared/icons';
import { SuccessOverlay } from './components/shared/SuccessOverlay';
import { InfoDialog, LocaleDialog, TypedConfirmDialog } from './components/shared/dialogs';
import type { AppViewMode } from './app/types';
import { clearBodyData as clearStoredBodyData } from './data/clearData';
import { persistedState } from './data/persistedState';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { usePersistedState } from './hooks/usePersistentState';
import { useStopwatchSession } from './hooks/useStopwatchSession';
import { useThemeColor } from './hooks/useThemeColor';
import { useTimerSession } from './hooks/useTimerSession';
import { useWakeLock } from './hooks/useWakeLock';
import { LOCALE_OPTIONS, MESSAGES, type Locale } from './i18n';
import type { TrainingProgram } from './plan/types';
import { getSessionTotals, sanitizeSettings } from './timer/math';
import type { Phase, TimerSettings, TimerToolMode } from './timer/types';

function App() {
  const [settings, setSettings] = usePersistedState<TimerSettings>(persistedState.timerSettings);
  const [timerTool, setTimerTool] = usePersistedState<TimerToolMode>(persistedState.timerTool);
  const [locale, setLocale] = usePersistedState<Locale>(persistedState.locale);
  const [statsOpen, setStatsOpen] = usePersistedState(persistedState.statsPanelOpen);
  const [appView, setAppView] = usePersistedState<AppViewMode>(persistedState.appView);
  const [trainingProgram, setTrainingProgram] = usePersistedState<TrainingProgram>(persistedState.trainingProgram);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsReturnView, setSettingsReturnView] = useState<AppViewMode>('timer');
  const [isLocaleDialogOpen, setIsLocaleDialogOpen] = useState(false);
  const [isClearBodyDataDialogOpen, setIsClearBodyDataDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [splashPhase, setSplashPhase] = useState<'visible' | 'hiding' | 'hidden'>('visible');

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
    feedback,
  });
  const {
    mode: stopwatchMode,
    elapsedMs,
    startSession: startStopwatch,
    pauseSession: pauseStopwatch,
    resumeSession: resumeStopwatch,
    resetSession: resetStopwatch,
  } = useStopwatchSession();
  const { canInstall, requestInstall } = useInstallPrompt({
    onFallbackPrompt: useCallback(() => setIsInstallDialogOpen(true), []),
  });

  const activeTimerMode = timerTool === 'hiit' ? mode : stopwatchMode;
  useWakeLock(activeTimerMode);
  useThemeColor(timerTool, activeTimerMode, phase);

  useEffect(() => {
    if (isSettingsOpen) {
      return;
    }

    setIsLocaleDialogOpen(false);
    setIsInstallDialogOpen(false);
  }, [isSettingsOpen]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdDuration = reduceMotion ? 800 : 2000;
    const fadeDuration = reduceMotion ? 84 : 168;

    const hideTimer = window.setTimeout(() => setSplashPhase('hiding'), holdDuration);
    const cleanupTimer = window.setTimeout(() => setSplashPhase('hidden'), holdDuration + fadeDuration);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, []);

  const messages = MESSAGES[locale];
  const localeMeta = LOCALE_OPTIONS.find((option) => option.id === locale) ?? LOCALE_OPTIONS[0];
  const sessionTotals = useMemo(() => getSessionTotals(settings), [settings]);
  const timerScreenTone = useMemo(() => {
    if (timerTool === 'stopwatch') {
      return 'screen-stopwatch';
    }

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
  }, [timerTool, mode, phase]);
  const isHiitSessionActive = timerTool === 'hiit' && mode !== 'setup';
  const isTimerSessionActive = activeTimerMode !== 'setup';
  const screenTone = isSettingsOpen
    ? 'screen-settings'
    : isTimerSessionActive || appView === 'timer'
      ? timerScreenTone
      : appView === 'plan'
        ? 'screen-plan'
        : 'screen-body';
  const phaseCopy: Record<Exclude<Phase, 'complete'>, { title: string; kicker: string }> = {
    delay: { title: messages.phaseDelayTitle, kicker: messages.phaseDelayKicker },
    active: { title: messages.phaseActiveTitle, kicker: messages.phaseActiveKicker },
    rest: { title: messages.phaseRestTitle, kicker: messages.phaseRestKicker },
  };
  const runningLabel = phase === 'complete' ? messages.phaseDoneTitle : phaseCopy[phase].title;
  const runningKicker = phase === 'complete' ? messages.phaseDoneKicker : phaseCopy[phase].kicker;
  const showModeTabs = !isSettingsOpen && !isHiitSessionActive;
  const showGlobalSettingsButton = !isSettingsOpen && !isHiitSessionActive;

  const openSettings = useCallback(
    (returnView: AppViewMode) => {
      setSettingsReturnView(returnView);
      setIsLocaleDialogOpen(false);
      setIsInstallDialogOpen(false);
      setIsSettingsOpen(true);
    },
    [],
  );

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setAppView(settingsReturnView);
  }, [settingsReturnView, setAppView]);

  const updateSetting = useCallback(
    <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => {
      setSettings((current) => sanitizeSettings({ ...current, [key]: next }));
    },
    [setSettings],
  );

  const clearBodyData = useCallback(async () => {
    await clearStoredBodyData();
    setIsClearBodyDataDialogOpen(false);
    window.location.reload();
  }, []);

  return (
    <main className={`app-shell ${screenTone} ${appView === 'timer' && isWarning ? 'screen-warning' : ''}`}>
      <OrientationLock label={messages.portraitModeLabel} />

      <div className={`app-content ${appView === 'timer' && mode === 'complete' ? 'app-content-success' : ''}`}>
        {splashPhase !== 'hidden' ? (
          <SplashScreen
            appName={messages.appName}
            isHiding={splashPhase === 'hiding'}
          />
        ) : null}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {appView === 'timer' && isWarning ? <div className={`warning-overlay warning-overlay-${phase}`} aria-hidden="true" /> : null}

        {showModeTabs || showGlobalSettingsButton ? (
          <div className="app-top-bar">
            {showModeTabs ? (
              <ModeTabs
                timerLabel={messages.timerTabLabel}
                planLabel={messages.planTabLabel}
                bodyLabel={messages.bodyTabLabel}
                value={appView}
                onChange={setAppView}
              />
            ) : null}
            {showGlobalSettingsButton ? (
              <button
                type="button"
                className="app-chrome-settings-button"
                onClick={() => openSettings(appView)}
                aria-label={messages.settingsLabel}
              >
                <CogIcon />
              </button>
            ) : null}
          </div>
        ) : null}

        <div key={appView} className="view-stage">
          <div hidden={isSettingsOpen}>
            {isTimerSessionActive && timerTool === 'hiit' ? (
              <RunScreen
                messages={messages}
                mode={activeTimerMode}
                phase={phase}
                round={round}
                rounds={settings.rounds}
                secondsLeft={secondsLeft}
                elapsedMs={elapsedMs}
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
            ) : appView === 'plan' ? (
              <PlanScreen
                messages={messages}
                program={trainingProgram}
                onProgramChange={setTrainingProgram}
              />
            ) : appView === 'body' ? (
              <BodyScreen
                messages={messages}
                locale={localeMeta.intl}
              />
            ) : (
              <SetupScreen
                messages={messages}
                timerTool={timerTool}
                settings={settings}
                statsOpen={statsOpen}
                sessionTotals={sessionTotals}
                stopwatchMode={stopwatchMode}
                stopwatchElapsedMs={elapsedMs}
                onSettingChange={updateSetting}
                onToggleStats={() => setStatsOpen((current) => !current)}
                onToolChange={setTimerTool}
                onStart={() => {
                  if (timerTool === 'hiit') {
                    void startSession();
                    return;
                  }

                  void startStopwatch();
                }}
                onStopwatchPause={pauseStopwatch}
                onStopwatchResume={resumeStopwatch}
                onStopwatchReset={resetStopwatch}
              />
            )}
          </div>

          {isSettingsOpen ? (
            <SettingsScreen
              messages={messages}
              localeLabel={localeMeta.label}
              isLocaleDialogOpen={isLocaleDialogOpen}
              canInstall={canInstall}
              soundEnabled={settings.soundEnabled}
              onBack={closeSettings}
              onOpenLocaleDialog={() => setIsLocaleDialogOpen(true)}
              onToggleSound={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              onInstall={() => void requestInstall()}
              onClearBodyData={() => setIsClearBodyDataDialogOpen(true)}
            />
          ) : null}
        </div>
      </div>

      {appView === 'timer' && mode === 'complete' ? <SuccessOverlay onDismiss={resetSession} returnLabel={messages.returnHomeLabel} /> : null}
      {isClearBodyDataDialogOpen ? (
        <TypedConfirmDialog
          title={messages.clearBodyDataTitle}
          body={messages.clearBodyDataConfirm}
          instruction={messages.typeYesInstruction}
          cancelLabel={messages.cancelLabel}
          confirmLabel={messages.deleteLabel}
          onCancel={() => setIsClearBodyDataDialogOpen(false)}
          onConfirm={clearBodyData}
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
