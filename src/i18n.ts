export type Locale = 'en' | 'sr';

export type Messages = {
  appName: string;
  portraitModeLabel: string;
  activeLabel: string;
  restLabel: string;
  roundsLabel: string;
  delayLabel: string;
  secondsUnit: string;
  roundsUnit: string;
  soundLabel: string;
  soundHint: string;
  languageLabel: string;
  settingsLabel: string;
  statsLabel: string;
  clearHistoryLabel: string;
  clearHistoryConfirm: string;
  clearHistoryTitle: string;
  cancelLabel: string;
  confirmLabel: string;
  onLabel: string;
  offLabel: string;
  startTimer: string;
  pauseLabel: string;
  resumeLabel: string;
  restartLabel: string;
  stopLabel: string;
  returnHomeLabel: string;
  phaseDelayTitle: string;
  phaseDelayKicker: string;
  phaseActiveTitle: string;
  phaseActiveKicker: string;
  phaseRestTitle: string;
  phaseRestKicker: string;
  phaseDoneTitle: string;
  phaseDoneKicker: string;
  sessionBreakdownTitle: string;
  totalDurationLabel: string;
  totalWorkLabel: string;
  totalRestLabel: string;
  totalDelayLabel: string;
  historyTitle: string;
  latestSuccessLabel: string;
  recentRunsLabel: string;
  noHistoryLabel: string;
  completedLabel: string;
  settingsUsedLabel: string;
  roundCounter: (current: number, total: number) => string;
};

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_OPTIONS: Array<{ id: Locale; label: string; intl: string }> = [
  { id: 'en', label: 'English', intl: 'en-US' },
  { id: 'sr', label: 'Српски', intl: 'sr-Cyrl-RS' },
];

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    appName: 'Pulse HIIT Timer',
    portraitModeLabel: 'Use portrait mode',
    activeLabel: 'Active',
    restLabel: 'Rest',
    roundsLabel: 'Rounds',
    delayLabel: 'Delay',
    secondsUnit: 'seconds',
    roundsUnit: 'rounds',
    soundLabel: 'Sound',
    soundHint: 'Beeps for countdowns and transitions.',
    languageLabel: 'Language',
    settingsLabel: 'Settings',
    statsLabel: 'Session & history',
    clearHistoryLabel: 'Clear history',
    clearHistoryConfirm: 'Clear all successful workout history?',
    clearHistoryTitle: 'Clear saved history?',
    cancelLabel: 'Cancel',
    confirmLabel: 'Clear',
    onLabel: 'On',
    offLabel: 'Off',
    startTimer: 'Start timer',
    pauseLabel: 'Pause',
    resumeLabel: 'Resume',
    restartLabel: 'Restart',
    stopLabel: 'Стоп',
    returnHomeLabel: 'Return to home screen',
    phaseDelayTitle: 'Get Ready',
    phaseDelayKicker: 'Initial delay',
    phaseActiveTitle: 'Work',
    phaseActiveKicker: 'Active interval',
    phaseRestTitle: 'Recover',
    phaseRestKicker: 'Rest interval',
    phaseDoneTitle: 'Done',
    phaseDoneKicker: 'Workout complete',
    sessionBreakdownTitle: 'Current session',
    totalDurationLabel: 'Total',
    totalWorkLabel: 'Work total',
    totalRestLabel: 'Rest total',
    totalDelayLabel: 'Delay',
    historyTitle: 'History',
    latestSuccessLabel: 'Latest success',
    recentRunsLabel: 'Recent successful runs',
    noHistoryLabel: 'No successful sessions yet.',
    completedLabel: 'Completed',
    settingsUsedLabel: 'Settings used',
    roundCounter: (current, total) => `Round ${current} / ${total}`,
  },
  sr: {
    appName: 'Pulse HIIT Timer',
    portraitModeLabel: 'Користи усправни приказ',
    activeLabel: 'Активно',
    restLabel: 'Одмор',
    roundsLabel: 'Рунде',
    delayLabel: 'Припрема',
    secondsUnit: 'секунде',
    roundsUnit: 'рунде',
    soundLabel: 'Звук',
    soundHint: 'Звучни сигнали за одбројавање и прелазе.',
    languageLabel: 'Језик',
    settingsLabel: 'Подешавања',
    statsLabel: 'Сесија и историја',
    clearHistoryLabel: 'Обриши историју',
    clearHistoryConfirm: 'Обрисати целу историју успешних тренинга?',
    clearHistoryTitle: 'Обрисати сачувану историју?',
    cancelLabel: 'Откажи',
    confirmLabel: 'Обриши',
    onLabel: 'Укључено',
    offLabel: 'Искључено',
    startTimer: 'Покрени тајмер',
    pauseLabel: 'Пауза',
    resumeLabel: 'Настави',
    restartLabel: 'Поново',
    stopLabel: 'Stop',
    returnHomeLabel: 'Повратак на почетни екран',
    phaseDelayTitle: 'Припрема',
    phaseDelayKicker: 'Почетно кашњење',
    phaseActiveTitle: 'Рад',
    phaseActiveKicker: 'Активни интервал',
    phaseRestTitle: 'Опоравак',
    phaseRestKicker: 'Интервал одмора',
    phaseDoneTitle: 'Готово',
    phaseDoneKicker: 'Тренинг је завршен',
    sessionBreakdownTitle: 'Тренутна сесија',
    totalDurationLabel: 'Укупно',
    totalWorkLabel: 'Укупан рад',
    totalRestLabel: 'Укупан одмор',
    totalDelayLabel: 'Припрема',
    historyTitle: 'Историја',
    latestSuccessLabel: 'Последњи успешан тренинг',
    recentRunsLabel: 'Последњи успешни тренинзи',
    noHistoryLabel: 'Још нема успешно завршених сесија.',
    completedLabel: 'Завршено',
    settingsUsedLabel: 'Коришћена подешавања',
    roundCounter: (current, total) => `Рунда ${current} / ${total}`,
  },
};
