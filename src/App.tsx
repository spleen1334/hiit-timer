import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_LOCALE, LOCALE_OPTIONS, MESSAGES, type Locale } from './i18n';

type Phase = 'delay' | 'active' | 'rest' | 'complete';
type SessionMode = 'setup' | 'running' | 'paused' | 'complete';

type TimerSettings = {
  activeSeconds: number;
  restSeconds: number;
  rounds: number;
  initialDelay: number;
  soundEnabled: boolean;
};

type HistoryEntry = {
  completedAt: string;
  totalSeconds: number;
  workSeconds: number;
  restSeconds: number;
  delaySeconds: number;
  settings: TimerSettings;
};

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  tint: string;
  unit: string;
  onChange: (next: number) => void;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const SETTINGS_KEY = 'pulse-hiit-settings';
const LOCALE_KEY = 'pulse-hiit-locale';
const HISTORY_KEY = 'pulse-hiit-history';
const SETTINGS_PANEL_KEY = 'pulse-hiit-settings-panel-open';
const STATS_PANEL_KEY = 'pulse-hiit-stats-panel-open';
const MAX_HISTORY = 12;
const TICK_MS = 100;

const DEFAULT_SETTINGS: TimerSettings = {
  activeSeconds: 40,
  restSeconds: 20,
  rounds: 8,
  initialDelay: 3,
  soundEnabled: true,
};

const SUCCESS_RAYS = Array.from({ length: 10 }, (_, index) => index);
const SUCCESS_CONFETTI = Array.from({ length: 18 }, (_, index) => index);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const readStoredBoolean = (key: string, fallback: boolean) => {
  const stored = globalThis.localStorage?.getItem(key);

  if (stored === 'true') {
    return true;
  }

  if (stored === 'false') {
    return false;
  }

  return fallback;
};
const sanitizeSettings = (settings: Partial<TimerSettings> | TimerSettings): TimerSettings => ({
  activeSeconds: clamp(Number(settings.activeSeconds ?? DEFAULT_SETTINGS.activeSeconds), 1, 120),
  restSeconds: clamp(Number(settings.restSeconds ?? DEFAULT_SETTINGS.restSeconds), 1, 120),
  rounds: clamp(Number(settings.rounds ?? DEFAULT_SETTINGS.rounds), 1, 20),
  initialDelay: clamp(Number(settings.initialDelay ?? DEFAULT_SETTINGS.initialDelay), 0, 60),
  soundEnabled: Boolean(settings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled),
});
const sanitizeHistory = (entries: unknown): HistoryEntry[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as Partial<HistoryEntry>;

      return {
        completedAt: String(candidate.completedAt ?? new Date().toISOString()),
        totalSeconds: Math.max(1, Number(candidate.totalSeconds ?? 1)),
        workSeconds: Math.max(0, Number(candidate.workSeconds ?? 0)),
        restSeconds: Math.max(0, Number(candidate.restSeconds ?? 0)),
        delaySeconds: Math.max(0, Number(candidate.delaySeconds ?? 0)),
        settings: sanitizeSettings(candidate.settings ?? DEFAULT_SETTINGS),
      };
    })
    .filter((entry): entry is HistoryEntry => entry !== null)
    .slice(0, MAX_HISTORY);
};
const isLocale = (value: string): value is Locale => LOCALE_OPTIONS.some((option) => option.id === value);
const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIosInstallable = () => {
  const userAgent = window.navigator.userAgent;
  const isAppleMobile = /iphone|ipad|ipod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /safari/i.test(userAgent) && !/crios|fxios|edgios|android/i.test(userAgent);

  return isAppleMobile && isSafari;
};
const formatClockDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const stored = globalThis.localStorage?.getItem(SETTINGS_KEY);

    if (!stored) {
      return sanitizeSettings(DEFAULT_SETTINGS);
    }

    try {
      return sanitizeSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {
      return sanitizeSettings(DEFAULT_SETTINGS);
    }
  });
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = globalThis.localStorage?.getItem(LOCALE_KEY);
    return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
  });
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const stored = globalThis.localStorage?.getItem(HISTORY_KEY);

    if (!stored) {
      return [];
    }

    try {
      return sanitizeHistory(JSON.parse(stored));
    } catch {
      return [];
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(() => readStoredBoolean(SETTINGS_PANEL_KEY, false));
  const [statsOpen, setStatsOpen] = useState(() => readStoredBoolean(STATS_PANEL_KEY, false));
  const [isLocaleDialogOpen, setIsLocaleDialogOpen] = useState(false);
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [isIosInstallPromptAvailable, setIsIosInstallPromptAvailable] = useState(() => !isStandaloneMode() && isIosInstallable());
  const [mode, setMode] = useState<SessionMode>('setup');
  const [phase, setPhase] = useState<Phase>('delay');
  const [round, setRound] = useState(1);
  const [phaseDuration, setPhaseDuration] = useState(settings.initialDelay);
  const [remainingMs, setRemainingMs] = useState(settings.initialDelay * 1000);

  const settingsRef = useRef(settings);
  const phaseRef = useRef<Phase>('delay');
  const roundRef = useRef(1);
  const deadlineRef = useRef<number | null>(null);
  const remainingMsRef = useRef(settings.initialDelay * 1000);
  const wholeSecondsRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_PANEL_KEY, String(settingsOpen));
  }, [settingsOpen]);

  useEffect(() => {
    window.localStorage.setItem(STATS_PANEL_KEY, String(statsOpen));
  }, [statsOpen]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    remainingMsRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    if (settingsOpen) {
      return;
    }

    setIsLocaleDialogOpen(false);
    setIsInstallDialogOpen(false);
  }, [settingsOpen]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsInstallDialogOpen(false);
      setIsInstalled(true);
      setIsIosInstallPromptAvailable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    const syncInstallState = () => {
      const standalone = isStandaloneMode();
      setIsInstalled(standalone);
      setIsIosInstallPromptAvailable(!standalone && isIosInstallable());
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    syncInstallState();
    mediaQuery.addEventListener?.('change', syncInstallState);
    document.addEventListener('visibilitychange', syncInstallState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', syncInstallState);
      document.removeEventListener('visibilitychange', syncInstallState);
    };
  }, []);

  useEffect(() => {
    const themeColor = (() => {
      if (mode === 'setup') {
        return '#111827';
      }

      if (phase === 'active') {
        return '#991b1b';
      }

      if (phase === 'rest') {
        return '#166534';
      }

      if (phase === 'complete') {
        return '#1e293b';
      }

      return '#172554';
    })();

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor);
  }, [mode, phase]);

  useEffect(() => {
    if (mode !== 'running') {
      return;
    }

    const tick = () => {
      if (!deadlineRef.current) {
        return;
      }

      const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(nextRemaining);

      const nextWholeSeconds = Math.ceil(nextRemaining / 1000);
      const lastWholeSeconds = wholeSecondsRef.current;

      if (
        lastWholeSeconds !== nextWholeSeconds &&
        nextWholeSeconds > 0 &&
        nextWholeSeconds <= 3 &&
        phaseRef.current !== 'complete'
      ) {
        playTone(nextWholeSeconds === 1 ? 1046.5 : 880, 0.09, 0.05);
      }

      wholeSecondsRef.current = nextWholeSeconds;

      if (nextRemaining <= 0) {
        advancePhase();
      }
    };

    tick();
    const interval = window.setInterval(tick, TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [mode]);

  useEffect(() => {
    const syncWakeLock = async () => {
      if (!('wakeLock' in navigator)) {
        return;
      }

      if (mode === 'running') {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
          wakeLockRef.current = null;
        }
        return;
      }

      if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => undefined);
        wakeLockRef.current = null;
      }
    };

    void syncWakeLock();

    return () => {
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => undefined);
        wakeLockRef.current = null;
      }
    };
  }, [mode]);

  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const messages = MESSAGES[locale];
  const localeMeta = LOCALE_OPTIONS.find((option) => option.id === locale) ?? LOCALE_OPTIONS[0];
  const sessionTotals = useMemo(() => {
    const workSeconds = settings.activeSeconds * settings.rounds;
    const restSeconds = settings.restSeconds * Math.max(0, settings.rounds - 1);
    const delaySeconds = settings.initialDelay;
    const totalSeconds = workSeconds + restSeconds + delaySeconds;

    return { workSeconds, restSeconds, delaySeconds, totalSeconds };
  }, [settings]);
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
  const phaseProgress =
    phaseDuration > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / (phaseDuration * 1000))) : 1;
  const isWarning = mode === 'running' && phase !== 'complete' && secondsLeft <= 3 && secondsLeft > 0;
  const roundProgress = (() => {
    if (phase === 'complete' || mode === 'complete') {
      return 1;
    }

    if (phase === 'delay') {
      return 0;
    }

    if (phase === 'rest') {
      return Math.min(1, round / settings.rounds);
    }

    return Math.min(1, ((round - 1) + phaseProgress) / settings.rounds);
  })();

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

  const updateSetting = <K extends keyof TimerSettings>(key: K, next: TimerSettings[K]) => {
    setSettings((current) => sanitizeSettings({ ...current, [key]: next }));
  };

  const canInstall = !isInstalled;

  const handleInstall = async () => {
    if (installPromptEvent) {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      } else {
        setInstallPromptEvent(null);
      }

      return;
    }

    setIsInstallDialogOpen(true);
  };

  const ensureAudioContext = async () => {
    if (typeof window === 'undefined' || !('AudioContext' in window)) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const playTone = (frequency: number, durationSeconds: number, gainValue: number) => {
    if (!settingsRef.current.soundEnabled) {
      return;
    }

    const audioContext = audioContextRef.current;

    if (!audioContext) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSeconds);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + durationSeconds + 0.02);
  };

  const notifyTransition = (nextPhase: Phase) => {
    if (settingsRef.current.soundEnabled) {
      if (nextPhase === 'active') {
        playTone(659.25, 0.16, 0.08);
        window.setTimeout(() => playTone(783.99, 0.16, 0.07), 100);
      } else if (nextPhase === 'rest') {
        playTone(523.25, 0.18, 0.08);
      } else if (nextPhase === 'complete') {
        playTone(783.99, 0.16, 0.08);
        window.setTimeout(() => playTone(987.77, 0.2, 0.07), 120);
      }
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(nextPhase === 'complete' ? [120, 60, 180] : 80);
    }
  };

  const applyPhaseState = (nextPhase: Phase, nextRound: number, durationSeconds: number) => {
    phaseRef.current = nextPhase;
    roundRef.current = nextRound;
    remainingMsRef.current = durationSeconds * 1000;
    deadlineRef.current = Date.now() + durationSeconds * 1000;
    wholeSecondsRef.current = durationSeconds;

    setPhase(nextPhase);
    setRound(nextRound);
    setPhaseDuration(durationSeconds);
    setRemainingMs(durationSeconds * 1000);
  };

  const finishSession = () => {
    const completedSettings = settingsRef.current;
    const workSeconds = completedSettings.activeSeconds * completedSettings.rounds;
    const restSeconds = completedSettings.restSeconds * Math.max(0, completedSettings.rounds - 1);
    const delaySeconds = completedSettings.initialDelay;
    const totalSeconds = workSeconds + restSeconds + delaySeconds;

    deadlineRef.current = null;
    phaseRef.current = 'complete';
    wholeSecondsRef.current = 0;
    setHistory((current) =>
      [
        {
          completedAt: new Date().toISOString(),
          totalSeconds,
          workSeconds,
          restSeconds,
          delaySeconds,
          settings: completedSettings,
        },
        ...current,
      ].slice(0, MAX_HISTORY),
    );
    setMode('complete');
    setPhase('complete');
    setRemainingMs(0);
    setPhaseDuration(0);
    notifyTransition('complete');
  };

  const advancePhase = () => {
    const currentPhase = phaseRef.current;
    const currentRound = roundRef.current;
    const currentSettings = settingsRef.current;

    if (currentPhase === 'delay') {
      applyPhaseState('active', 1, currentSettings.activeSeconds);
      notifyTransition('active');
      return;
    }

    if (currentPhase === 'active') {
      if (currentRound >= currentSettings.rounds) {
        finishSession();
        return;
      }

      applyPhaseState('rest', currentRound, currentSettings.restSeconds);
      notifyTransition('rest');
      return;
    }

    if (currentPhase === 'rest') {
      const nextRound = currentRound + 1;
      applyPhaseState('active', nextRound, currentSettings.activeSeconds);
      notifyTransition('active');
    }
  };

  const startSession = async () => {
    await ensureAudioContext();

    const nextPhase = settings.initialDelay > 0 ? 'delay' : 'active';
    const durationSeconds = nextPhase === 'delay' ? settings.initialDelay : settings.activeSeconds;

    setMode('running');
    applyPhaseState(nextPhase, 1, durationSeconds);

    if (nextPhase === 'active') {
      notifyTransition('active');
    }
  };

  const pauseSession = () => {
    if (mode !== 'running' || !deadlineRef.current) {
      return;
    }

    const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
    deadlineRef.current = null;
    remainingMsRef.current = nextRemaining;
    setRemainingMs(nextRemaining);
    setMode('paused');
  };

  const resumeSession = async () => {
    await ensureAudioContext();
    deadlineRef.current = Date.now() + remainingMsRef.current;
    wholeSecondsRef.current = Math.ceil(remainingMsRef.current / 1000);
    setMode('running');
  };

  const resetSession = () => {
    const nextPhase = settings.initialDelay > 0 ? 'delay' : 'active';
    const nextDuration = nextPhase === 'delay' ? settings.initialDelay : settings.activeSeconds;

    deadlineRef.current = null;
    phaseRef.current = nextPhase;
    roundRef.current = 1;
    remainingMsRef.current = nextDuration * 1000;
    wholeSecondsRef.current = null;
    setMode('setup');
    setPhase(nextPhase);
    setPhaseDuration(nextDuration);
    setRemainingMs(nextDuration * 1000);
    setRound(1);
  };

  const clearHistory = () => {
    setHistory([]);
    setIsClearHistoryDialogOpen(false);
  };

  return (
    <main className={`app-shell ${screenTone} ${isWarning ? 'screen-warning' : ''}`}>
      <div className="orientation-lock" role="status" aria-live="polite">
        <div className="orientation-lock-card">
          <PhoneRotateIcon />
          <p>{messages.portraitModeLabel}</p>
        </div>
      </div>

      <div className={`app-content ${mode === 'complete' ? 'app-content-success' : ''}`}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {isWarning ? <div className={`warning-overlay warning-overlay-${phase}`} aria-hidden="true" /> : null}

        {mode === 'setup' ? (
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
                onChange={(next) => updateSetting('activeSeconds', next)}
              />
              <Stepper
                label={messages.restLabel}
                value={settings.restSeconds}
                min={1}
                max={120}
                tint="green"
                unit={messages.secondsUnit}
                onChange={(next) => updateSetting('restSeconds', next)}
              />
              <Stepper
                label={messages.roundsLabel}
                value={settings.rounds}
                min={1}
                max={20}
                tint="gold"
                unit={messages.roundsUnit}
                onChange={(next) => updateSetting('rounds', next)}
              />
              <Stepper
                label={messages.delayLabel}
                value={settings.initialDelay}
                min={0}
                max={60}
                tint="blue"
                unit={messages.secondsUnit}
                onChange={(next) => updateSetting('initialDelay', next)}
              />
            </div>

            <div className="panel-toggle-row">
              <div className="panel-section">
                <button
                  type="button"
                  className={`panel-toggle ${settingsOpen ? 'is-open' : ''}`}
                  onClick={() => setSettingsOpen((current) => !current)}
                  aria-expanded={settingsOpen}
                  aria-controls="settings-panel"
                >
                  <span className="panel-toggle-icon-wrap">
                    <CogIcon />
                  </span>
                  <span>{messages.settingsLabel}</span>
                  <span className="panel-toggle-chevron" aria-hidden="true">
                    {settingsOpen ? '−' : '+'}
                  </span>
                </button>

                <section
                  id="settings-panel"
                  className={`collapsible-panel ${settingsOpen ? 'is-open' : ''}`}
                  aria-hidden={!settingsOpen}
                >
                  <div className="collapsible-inner">
                    <div className="utility-grid">
                      <div className="toolbar-card toolbar-card-split">
                        <div className="toolbar-stack">
                          <p className="toolbar-label">{messages.languageLabel}</p>
                          <button
                            type="button"
                            className="locale-trigger"
                            onClick={() => setIsLocaleDialogOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={isLocaleDialogOpen}
                          >
                            <span className="locale-trigger-text">{localeMeta.label}</span>
                            <span className="locale-trigger-chevron" aria-hidden="true">
                              +
                            </span>
                          </button>
                        </div>
                        <div className="toolbar-actions">
                          <div className="sound-meta">
                            <span className={`sound-indicator ${settings.soundEnabled ? 'is-on' : ''}`} aria-hidden="true">
                              {settings.soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
                            </span>
                            <div>
                              <p className="toolbar-label">{messages.soundLabel}</p>
                              <p className="toolbar-hint">{messages.soundHint}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`sound-switch ${settings.soundEnabled ? 'is-on' : ''}`}
                            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                            aria-pressed={settings.soundEnabled}
                            aria-label={messages.soundLabel}
                          >
                            <span className="sound-switch-track">
                              <span className="sound-switch-thumb" />
                            </span>
                            <span className="sound-switch-text">
                              {settings.soundEnabled ? messages.onLabel : messages.offLabel}
                            </span>
                          </button>

                          {canInstall ? (
                            <button type="button" className="install-button" onClick={() => void handleInstall()}>
                              {messages.installAppLabel}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            className="clear-history-button"
                            onClick={() => setIsClearHistoryDialogOpen(true)}
                          >
                            {messages.clearHistoryLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="panel-section">
                <button
                  type="button"
                  className={`panel-toggle ${statsOpen ? 'is-open' : ''}`}
                  onClick={() => setStatsOpen((current) => !current)}
                  aria-expanded={statsOpen}
                  aria-controls="stats-panel"
                >
                  <span className="panel-toggle-icon-wrap">
                    <InsightsIcon />
                  </span>
                  <span>{messages.statsLabel}</span>
                  <span className="panel-toggle-chevron" aria-hidden="true">
                    {statsOpen ? '−' : '+'}
                  </span>
                </button>

                <section
                  id="stats-panel"
                  className={`collapsible-panel ${statsOpen ? 'is-open' : ''}`}
                  aria-hidden={!statsOpen}
                >
                  <div className="collapsible-inner">
                    <div className="insights-grid">
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
                      <span
                        className="session-graph-segment session-graph-delay"
                        style={{ flexGrow: Math.max(sessionTotals.delaySeconds, 0) }}
                      />
                      <span
                        className="session-graph-segment session-graph-work"
                        style={{ flexGrow: Math.max(sessionTotals.workSeconds, 0) }}
                      />
                      <span
                        className="session-graph-segment session-graph-rest"
                        style={{ flexGrow: Math.max(sessionTotals.restSeconds, 0) }}
                      />
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
                              <span>{messages.activeLabel} {latestHistory.settings.activeSeconds}</span>
                              <span>{messages.restLabel} {latestHistory.settings.restSeconds}</span>
                              <span>{messages.roundsLabel} {latestHistory.settings.rounds}</span>
                              <span>{messages.delayLabel} {latestHistory.settings.initialDelay}</span>
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
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <button type="button" className="primary-button" onClick={() => void startSession()}>
              {messages.startTimer}
            </button>
          </section>
        ) : (
          <section className="panel run-panel">
            <div className="run-meta">
              <div className="run-meta-copy">
                <p className="eyebrow">{runningKicker}</p>
                <div className="round-progress" aria-hidden="true">
                  <div
                    className="round-progress-fill"
                    style={{ transform: `scaleX(${roundProgress})` }}
                  />
                </div>
              </div>
              <p className="round-pill">
                {messages.roundCounter(Math.min(round, settings.rounds), settings.rounds)}
              </p>
            </div>

            <div className={`timer-card timer-card-${phase} ${isWarning ? 'timer-card-warning' : ''}`}>
              <div className="timer-card-progress" aria-hidden="true">
                <div
                  className="timer-card-progress-fill"
                  style={{ transform: `scaleX(${phaseProgress})` }}
                />
              </div>
              <div className="timer-card-content">
                <p className="phase-name">{runningLabel}</p>
                <div className="countdown">{secondsLeft}</div>
              </div>
            </div>

            <div className="run-controls">
              {mode === 'paused' ? (
                <button type="button" className="secondary-button action-button" onClick={() => void resumeSession()}>
                  <PlayIcon />
                  {messages.resumeLabel}
                </button>
              ) : mode === 'complete' ? (
                <button type="button" className="secondary-button action-button" onClick={() => void startSession()}>
                  <RestartIcon />
                  {messages.restartLabel}
                </button>
              ) : (
                <button type="button" className="secondary-button action-button" onClick={pauseSession}>
                  <PauseIcon />
                  {messages.pauseLabel}
                </button>
              )}

              <button type="button" className="ghost-button action-button" onClick={resetSession}>
                <StopIcon />
                {messages.stopLabel}
              </button>
            </div>
          </section>
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

function Stepper({ label, value, min, max, step = 1, tint, unit, onChange }: StepperProps) {
  return (
    <div className={`stepper-card stepper-${tint}`}>
      <div className="stepper-meta">
        <div>
          <p className="stepper-label">{label}</p>
          <p className="stepper-unit">{unit}</p>
        </div>
        <div className="stepper-value">{value}</div>
      </div>

      <div className="stepper-controls">
        <button type="button" onClick={() => onChange(clamp(value - step, min, max))}>
          -
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
        />
        <button type="button" onClick={() => onChange(clamp(value + step, min, max))}>
          +
        </button>
      </div>
    </div>
  );
}

function AppMark({ label }: { label: string }) {
  return (
    <div className="app-mark" aria-label={label}>
      <span className="app-mark-chip app-mark-work" />
      <span className="app-mark-core">
        <svg viewBox="0 0 64 64" className="app-mark-icon" aria-hidden="true">
          <circle cx="32" cy="34" r="18" fill="none" stroke="currentColor" strokeWidth="5" />
          <path d="M32 18V34L42.5 40.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="app-mark-chip app-mark-rest" />
    </div>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
      <rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path d="M7 5.5L19 12L7 18.5V5.5Z" fill="currentColor" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <rect x="5" y="5" width="14" height="14" rx="2.2" fill="currentColor" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path
        d="M12 5C8.13 5 5 8.13 5 12C5 15.87 8.13 19 12 19C15.11 19 17.74 16.97 18.65 14.17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M15 5H19V9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M19 5L14.5 9.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path d="M5 14H9L14 18V6L9 10H5V14Z" fill="currentColor" />
      <path
        d="M17 9.5C18.2 10.5 19 11.9 19 13.5C19 15.1 18.2 16.5 17 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.9 6.8C20.9 8.5 22 10.9 22 13.5C22 16.1 20.9 18.5 18.9 20.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path d="M5 14H9L14 18V6L9 10H5V14Z" fill="currentColor" />
      <path
        d="M17 10L22 15M22 10L17 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path
        d="M12 8.6A3.4 3.4 0 1 0 12 15.4A3.4 3.4 0 1 0 12 8.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19 12C19 11.5 18.96 11 18.88 10.53L21 8.88L18.9 5.12L16.34 6.04C15.63 5.47 14.83 5.03 13.97 4.77L13.58 2H10.42L10.03 4.77C9.17 5.03 8.37 5.47 7.66 6.04L5.1 5.12L3 8.88L5.12 10.53C5.04 11 5 11.5 5 12C5 12.5 5.04 13 5.12 13.47L3 15.12L5.1 18.88L7.66 17.96C8.37 18.53 9.17 18.97 10.03 19.23L10.42 22H13.58L13.97 19.23C14.83 18.97 15.63 18.53 16.34 17.96L18.9 18.88L21 15.12L18.88 13.47C18.96 13 19 12.5 19 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path d="M5 19H19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="11" width="3.5" height="6" rx="1" fill="currentColor" />
      <rect x="10.25" y="7.5" width="3.5" height="9.5" rx="1" fill="currentColor" />
      <rect x="14.5" y="4" width="3.5" height="13" rx="1" fill="currentColor" />
    </svg>
  );
}

function TimerStackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <circle cx="12" cy="13" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10V13L14.4 14.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 3H15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="button-icon">
      <path
        d="M6.5 8.5A7 7 0 1 1 5 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M5 6V10H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9.5V13L14.6 14.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ConfirmDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="dialog-card">
        <p id="confirm-dialog-title" className="dialog-title">
          {title}
        </p>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="dialog-button dialog-button-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function LocaleDialog({
  title,
  cancelLabel,
  selectedLocale,
  onClose,
  onSelect,
}: {
  title: string;
  cancelLabel: string;
  selectedLocale: Locale;
  onClose: () => void;
  onSelect: (nextLocale: Locale) => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="locale-dialog-title">
      <div className="dialog-card locale-dialog-card">
        <p id="locale-dialog-title" className="dialog-title">
          {title}
        </p>
        <div className="locale-dialog-options" role="listbox" aria-label={title}>
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`locale-dialog-option ${selectedLocale === option.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(option.id)}
              role="option"
              aria-selected={selectedLocale === option.id}
            >
              <span>{option.label}</span>
              <span className="locale-option-mark" aria-hidden="true">
                {selectedLocale === option.id ? '●' : ''}
              </span>
            </button>
          ))}
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoDialog({
  title,
  body,
  closeLabel,
  onClose,
}: {
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="info-dialog-title">
      <div className="dialog-card">
        <p id="info-dialog-title" className="dialog-title">
          {title}
        </p>
        <p className="dialog-body">{body}</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-button dialog-button-secondary" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessOverlay({ onDismiss, returnLabel }: { onDismiss: () => void; returnLabel: string }) {
  return (
    <div className="success-overlay">
      <div className="success-wash" />
      <button
        type="button"
        className="success-stage"
        onClick={onDismiss}
        aria-label={returnLabel}
      >
        <div className="success-ring success-ring-primary" />
        <div className="success-ring success-ring-secondary" />
        <div className="success-core" />
        <div className="success-badge">
          <svg viewBox="0 0 24 24" className="success-check">
            <path
              d="M5.5 12.5L10 17L18.5 8.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {SUCCESS_RAYS.map((index) => (
          <span
            key={`ray-${index}`}
            className="success-ray"
            style={
              {
                '--angle': `${index * 36}deg`,
                '--delay': `${index * 45}ms`,
              } as CSSProperties
            }
          />
        ))}
      </button>
      <div className="success-confetti-field">
        {SUCCESS_CONFETTI.map((index) => (
          <span
            key={`confetti-${index}`}
            className="success-confetti"
            style={
              {
                '--left': `${4 + index * 5.2}%`,
                '--delay': `${(index % 6) * 110}ms`,
                '--duration': `${1900 + (index % 4) * 180}ms`,
                '--rotation': `${-28 + (index % 7) * 10}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

function PhoneRotateIcon() {
  return (
    <svg viewBox="0 0 64 64" className="orientation-lock-icon" aria-hidden="true">
      <rect x="18" y="8" width="20" height="34" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M46 24C50.4 27.4 53 32.3 53 37.5C53 47.2 44.7 55 34.5 55C29.2 55 24.2 52.8 20.7 49" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M21 54L20.7 47.5L27.2 47.7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default App;
