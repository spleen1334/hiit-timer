export type Locale = 'en' | 'sr';

export type Messages = {
  appName: string;
  timerTabLabel: string;
  planTabLabel: string;
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
  settingsTitle: string;
  settingsSubtitle: string;
  backLabel: string;
  editLabel: string;
  statsLabel: string;
  installAppLabel: string;
  installAppTitle: string;
  installAppBody: string;
  clearHistoryLabel: string;
  clearHistoryConfirm: string;
  clearHistoryTitle: string;
  exportPlanLabel: string;
  importPlanLabel: string;
  planImportHint: string;
  planImportSuccess: string;
  planImportError: string;
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
  planTitle: string;
  planSubtitle: string;
  workoutSectionLabel: string;
  warmupSectionLabel: string;
  cardioSectionLabel: string;
  cooldownSectionLabel: string;
  notesSectionLabel: string;
  notesInputLabel: string;
  warmupInputLabel: string;
  cooldownInputLabel: string;
  cardioExerciseLabel: string;
  cardioTimeLabel: string;
  setsLabel: string;
  repsLabel: string;
  weightLabel: string;
  pauseLabelPlan: string;
  bodyPartLabel: string;
  titleLabel: string;
  descriptionLabel: string;
  makeSupersetLabel: string;
  supersetTargetLabel: string;
  removeSupersetLabel: string;
  supersetHintLabel: string;
  rotateSupersetLabel: string;
  reorderLabel: string;
  collapseLabel: string;
  expandLabel: string;
  addWorkoutLabel: string;
  removeWorkoutLabel: string;
  addCardioLabel: string;
  removeCardioLabel: string;
  roundCounter: (current: number, total: number) => string;
};

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_OPTIONS: Array<{ id: Locale; label: string; intl: string }> = [
  { id: 'en', label: 'English', intl: 'en-US' },
  { id: 'sr', label: 'Српски', intl: 'sr-Cyrl-RS' },
];

export const isLocale = (value: string): value is Locale => LOCALE_OPTIONS.some((option) => option.id === value);

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    appName: 'Pulse Trainer',
    timerTabLabel: 'Timer',
    planTabLabel: 'Plan',
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
    settingsTitle: 'Settings',
    settingsSubtitle: 'Language, sound, history, and plan tools.',
    backLabel: 'Back',
    editLabel: 'Edit',
    statsLabel: 'Session & history',
    installAppLabel: 'Install app',
    installAppTitle: 'Install Pulse Trainer',
    installAppBody:
      'If the install prompt does not appear, use your browser menu and choose Install app or Add to Home Screen. On iPhone Safari, use Share and then Add to Home Screen.',
    clearHistoryLabel: 'Clear history',
    clearHistoryConfirm: 'Clear all successful workout history?',
    clearHistoryTitle: 'Clear saved history?',
    exportPlanLabel: 'Export plan',
    importPlanLabel: 'Import plan',
    planImportHint: 'Use a training plan JSON file exported from this app.',
    planImportSuccess: 'Training plan imported.',
    planImportError: 'That JSON is not a valid training plan.',
    cancelLabel: 'Cancel',
    confirmLabel: 'Clear',
    onLabel: 'On',
    offLabel: 'Off',
    startTimer: 'Start timer',
    pauseLabel: 'Pause',
    resumeLabel: 'Resume',
    restartLabel: 'Restart',
    stopLabel: 'Stop',
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
    planTitle: 'Training Program',
    planSubtitle: 'Build supersets by dragging one exercise card onto another.',
    workoutSectionLabel: 'Workout',
    warmupSectionLabel: 'Warmup',
    cardioSectionLabel: 'Cardio',
    cooldownSectionLabel: 'Cooldown',
    notesSectionLabel: 'Notes',
    notesInputLabel: 'Session notes',
    warmupInputLabel: 'Warmup details',
    cooldownInputLabel: 'Cooldown details',
    cardioExerciseLabel: 'Exercise',
    cardioTimeLabel: 'Time',
    setsLabel: 'Sets',
    repsLabel: 'Reps',
    weightLabel: 'Weight',
    pauseLabelPlan: 'Pause',
    bodyPartLabel: 'Body part',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    makeSupersetLabel: 'Superset',
    supersetTargetLabel: 'Pick pair',
    removeSupersetLabel: 'Remove superset',
    supersetHintLabel: 'Drag to reorder. Drop on a card to create a superset. Drag inside a superset to reorder.',
    rotateSupersetLabel: 'Rotate',
    reorderLabel: 'Reorder',
    collapseLabel: 'Hide',
    expandLabel: 'Show',
    addWorkoutLabel: 'Add workout',
    removeWorkoutLabel: 'Remove workout',
    addCardioLabel: 'Add cardio',
    removeCardioLabel: 'Remove cardio',
    roundCounter: (current, total) => `Round ${current} / ${total}`,
  },
  sr: {
    appName: 'Pulse Trainer',
    timerTabLabel: 'Timer',
    planTabLabel: 'Plan',
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
    settingsTitle: 'Подешавања',
    settingsSubtitle: 'Језик, звук, историја и алати за план.',
    backLabel: 'Назад',
    editLabel: 'Уреди',
    statsLabel: 'Сесија и историја',
    installAppLabel: 'Инсталирај апликацију',
    installAppTitle: 'Инсталирај Pulse Trainer',
    installAppBody:
      'Ако се прозор за инсталацију не појави, отвори мени прегледача и изабери Install app или Add to Home Screen. На iPhone Safari-ју користи Share па Add to Home Screen.',
    clearHistoryLabel: 'Обриши историју',
    clearHistoryConfirm: 'Обрисати целу историју успешних тренинга?',
    clearHistoryTitle: 'Обрисати сачувану историју?',
    exportPlanLabel: 'Извези план',
    importPlanLabel: 'Увези план',
    planImportHint: 'Користи JSON план тренинга извезен из ове апликације.',
    planImportSuccess: 'План тренинга је увезен.',
    planImportError: 'Тај JSON није важећи план тренинга.',
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
    planTitle: 'План тренинга',
    planSubtitle: 'Направи суперсет превлачењем једне вежбе на другу.',
    workoutSectionLabel: 'Главни тренинг',
    warmupSectionLabel: 'Загревање',
    cardioSectionLabel: 'Кардио',
    cooldownSectionLabel: 'Хлађење',
    notesSectionLabel: 'Белешке',
    notesInputLabel: 'Белешке за сесију',
    warmupInputLabel: 'Детаљи загревања',
    cooldownInputLabel: 'Детаљи хлађења',
    cardioExerciseLabel: 'Вежба',
    cardioTimeLabel: 'Време',
    setsLabel: 'Серије',
    repsLabel: 'Понављања',
    weightLabel: 'Тежина',
    pauseLabelPlan: 'Пауза',
    bodyPartLabel: 'Мишићна група',
    titleLabel: 'Наслов',
    descriptionLabel: 'Опис',
    makeSupersetLabel: 'Суперсет',
    supersetTargetLabel: 'Изабери пар',
    removeSupersetLabel: 'Уклони суперсет',
    supersetHintLabel: 'Превуци за редослед. Спусти на картицу за суперсет. Превуци унутар суперсета за редослед.',
    rotateSupersetLabel: 'Ротација',
    reorderLabel: 'Премести',
    collapseLabel: 'Сакриј',
    expandLabel: 'Прикажи',
    addWorkoutLabel: 'Додај вежбу',
    removeWorkoutLabel: 'Уклони вежбу',
    addCardioLabel: 'Додај кардио',
    removeCardioLabel: 'Уклони кардио',
    roundCounter: (current, total) => `Рунда ${current} / ${total}`,
  },
};
