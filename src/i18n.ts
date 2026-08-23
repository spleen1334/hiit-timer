export type Locale = 'en' | 'sr';

export type Messages = {
  appName: string;
  loadingSplashLabel: string;
  loadingSplashHint: string;
  timerHeaderTitle: string;
  timerTabLabel: string;
  planTabLabel: string;
  hiitTimerLabel: string;
  stopwatchLabel: string;
  stopwatchHeaderTitle: string;
  startStopwatch: string;
  resetLabel: string;
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
  doneLabel: string;
  statsLabel: string;
  installAppLabel: string;
  installAppTitle: string;
  installAppBody: string;
  planTimerDataLabel: string;
  planTimerDataHint: string;
  exportPlanTimerDataLabel: string;
  importPlanTimerDataLabel: string;
  planTimerDataExportSuccess: string;
  planTimerDataSuccess: string;
  planTimerDataError: string;
  bodyDataLabel: string;
  bodyDataHint: string;
  exportBodyDataLabel: string;
  importBodyDataLabel: string;
  bodyDataExportSuccess: string;
  bodyDataSuccess: string;
  bodyDataError: string;
  googleDriveLabel: string;
  googleDriveHint: string;
  googleDriveNotConfiguredHint: string;
  googleDriveExportLabel: string;
  googleDriveExportingLabel: string;
  googleDriveImportLabel: string;
  googleDriveImportComingSoon: string;
  googleDriveExportSuccess: string;
  googleDriveExportError: string;
  deleteDataLabel: string;
  clearBodyDataLabel: string;
  clearBodyDataTitle: string;
  clearBodyDataConfirm: string;
  typeYesInstruction: string;
  deleteLabel: string;
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
  completedLabel: string;
  planTitle: string;
  planEmptyTextLabel: string;
  bodyTabLabel: string;
  bodyTitleLabel: string;
  workoutSectionLabel: string;
  warmupSectionLabel: string;
  cardioSectionLabel: string;
  cooldownSectionLabel: string;
  notesSectionLabel: string;
  bodyMetricsSectionLabel: string;
  bodyMetricsCurrentLabel: string;
  bodyMetricsStatsLabel: string;
  bodyMetricsRecentLabel: string;
  bodyMetricsLoadMoreLabel: string;
  bodyMetricsChartLabel: string;
  bodyMetricsGraphLabel: string;
  bodyMetricsAddLabel: string;
  bodyMetricsChartHintLabel: string;
  bodyMetricsMonthNavigationLabel: string;
  bodyMetricsPreviousMonthLabel: string;
  bodyMetricsNextMonthLabel: string;
  bodyMetricsEmptyLabel: string;
  bodyMetricsChartEmptyLabel: string;
  bodyMetricsDateLabel: string;
  bodyMetricsDateHint: string;
  bodyMetricsBodyFatLabel: string;
  bodyMetricsBodyFatToggleLabel: string;
  bodyMetricsHeightLabel: string;
  bodyMetricsAgeLabel: string;
  bodyMetricsHeightHint: string;
  bodyMetricsBmiLabel: string;
  bodyMetricsSaveLabel: string;
  bodyMetricsUpdateLabel: string;
  bodyMetricsRemoveLabel: string;
  bodyMetricsRange1MonthLabel: string;
  bodyMetricsRange3MonthsLabel: string;
  bodyMetricsRange6MonthsLabel: string;
  bodyMetricsRange1YearLabel: string;
  bodyMetricsRangeAllLabel: string;
  notesInputLabel: string;
  warmupInputLabel: string;
  cooldownInputLabel: string;
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
    loadingSplashLabel: 'Preparing your session',
    loadingSplashHint: 'Loading intervals and saved workout flow…',
    timerHeaderTitle: 'Interval timer',
    timerTabLabel: 'Timer',
    planTabLabel: 'Plan',
    hiitTimerLabel: 'HIIT Timer',
    stopwatchLabel: 'Stopwatch',
    stopwatchHeaderTitle: 'Stopwatch',
    startStopwatch: 'Start stopwatch',
    resetLabel: 'Reset',
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
    settingsSubtitle: 'Language, sound, and app data tools.',
    backLabel: 'Back',
    editLabel: 'Edit',
    doneLabel: 'Done',
    statsLabel: 'Session',
    installAppLabel: 'Install app',
    installAppTitle: 'Install Pulse Trainer',
    installAppBody:
      'If the install prompt does not appear, use your browser menu and choose Install app or Add to Home Screen. On iPhone Safari, use Share and then Add to Home Screen.',
    planTimerDataLabel: 'Plan & Timer',
    planTimerDataHint: 'Back up your training plan and timer settings as JSON.',
    exportPlanTimerDataLabel: 'Export Plan & Timer JSON',
    importPlanTimerDataLabel: 'Import Plan & Timer JSON',
    planTimerDataExportSuccess: 'Plan & Timer JSON exported.',
    planTimerDataSuccess: 'Plan & Timer data imported. Reloading…',
    planTimerDataError: 'That file is not valid Plan & Timer data.',
    bodyDataLabel: 'Body',
    bodyDataHint: 'Back up your body measurements, saved height, and age as a CSV file.',
    exportBodyDataLabel: 'Export Body CSV',
    importBodyDataLabel: 'Import Body CSV',
    bodyDataExportSuccess: 'Body CSV exported.',
    bodyDataSuccess: 'Body data imported. Reloading…',
    bodyDataError: 'That file is not valid Body CSV data.',
    googleDriveLabel: 'Google Drive',
    googleDriveHint: 'Save a full app data backup to your Google Drive Pulse Trainer folder.',
    googleDriveNotConfiguredHint: 'Google Drive export is not configured for this build.',
    googleDriveExportLabel: 'Export to Google Drive',
    googleDriveExportingLabel: 'Exporting…',
    googleDriveImportLabel: 'Import from Google Drive',
    googleDriveImportComingSoon: 'Import requires future Picker/API key setup and is not available yet.',
    googleDriveExportSuccess: 'Exported to Google Drive.',
    googleDriveExportError: 'Google Drive export failed. Try again later.',
    deleteDataLabel: 'Delete Data',
    clearBodyDataLabel: 'Clear Body Data History',
    clearBodyDataTitle: 'Clear body data?',
    clearBodyDataConfirm: 'This deletes body metrics history, saved height, and age from this device.',
    typeYesInstruction: 'Type YES to confirm.',
    deleteLabel: 'Delete',
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
    completedLabel: 'Completed',
    planTitle: 'Training Program',
    planEmptyTextLabel: 'Nothing added yet. Tap Edit to add details.',
    bodyTabLabel: 'Body',
    bodyTitleLabel: 'Body',
    workoutSectionLabel: 'Workout',
    warmupSectionLabel: 'Warmup',
    cardioSectionLabel: 'Cardio',
    cooldownSectionLabel: 'Cooldown',
    notesSectionLabel: 'Notes',
    bodyMetricsSectionLabel: 'Body weight',
    bodyMetricsCurrentLabel: 'Latest',
    bodyMetricsStatsLabel: 'Body Stats',
    bodyMetricsRecentLabel: 'Recent entries',
    bodyMetricsLoadMoreLabel: 'Load more',
    bodyMetricsChartLabel: 'Filter',
    bodyMetricsGraphLabel: 'Body measurements graph',
    bodyMetricsAddLabel: 'Add measurement',
    bodyMetricsChartHintLabel: 'Tap a dot',
    bodyMetricsMonthNavigationLabel: 'Anchor month',
    bodyMetricsPreviousMonthLabel: 'Previous',
    bodyMetricsNextMonthLabel: 'Next',
    bodyMetricsEmptyLabel: 'No entries yet.',
    bodyMetricsChartEmptyLabel: 'No data in range.',
    bodyMetricsDateLabel: 'Date',
    bodyMetricsDateHint: 'Today. Saving the same date replaces that day.',
    bodyMetricsBodyFatLabel: 'Body fat %',
    bodyMetricsBodyFatToggleLabel: 'Body fat',
    bodyMetricsHeightLabel: 'Height (cm)',
    bodyMetricsAgeLabel: 'Age',
    bodyMetricsHeightHint: 'Used for BMI.',
    bodyMetricsBmiLabel: 'BMI',
    bodyMetricsSaveLabel: 'Save',
    bodyMetricsUpdateLabel: 'Update',
    bodyMetricsRemoveLabel: 'Remove',
    bodyMetricsRange1MonthLabel: 'Current month',
    bodyMetricsRange3MonthsLabel: '3M',
    bodyMetricsRange6MonthsLabel: '6M',
    bodyMetricsRange1YearLabel: '1Y',
    bodyMetricsRangeAllLabel: 'All',
    notesInputLabel: 'Session notes',
    warmupInputLabel: 'Warmup details',
    cooldownInputLabel: 'Cooldown details',
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
    roundCounter: (current, total) => `Round ${current} / ${total}`,
  },
  sr: {
    appName: 'Pulse Trainer',
    loadingSplashLabel: 'Припрема сесије',
    loadingSplashHint: 'Учитавање интервала и сачуваног тока тренинга…',
    timerHeaderTitle: 'Интервални тајмер',
    timerTabLabel: 'Timer',
    planTabLabel: 'Plan',
    hiitTimerLabel: 'HIIT tajmer',
    stopwatchLabel: 'Štoperica',
    stopwatchHeaderTitle: 'Štoperica',
    startStopwatch: 'Pokreni štopericu',
    resetLabel: 'Resetuj',
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
    settingsSubtitle: 'Језик, звук и алати за податке апликације.',
    backLabel: 'Назад',
    editLabel: 'Уреди',
    doneLabel: 'Готово',
    statsLabel: 'Сесија',
    installAppLabel: 'Инсталирај апликацију',
    installAppTitle: 'Инсталирај Pulse Trainer',
    installAppBody:
      'Ако се прозор за инсталацију не појави, отвори мени прегледача и изабери Install app или Add to Home Screen. На iPhone Safari-ју користи Share па Add to Home Screen.',
    planTimerDataLabel: 'План и тајмер',
    planTimerDataHint: 'Сачувај план тренинга и подешавања тајмера као JSON.',
    exportPlanTimerDataLabel: 'Извези JSON плана и тајмера',
    importPlanTimerDataLabel: 'Увези JSON плана и тајмера',
    planTimerDataExportSuccess: 'JSON плана и тајмера је извезен.',
    planTimerDataSuccess: 'Подаци плана и тајмера су увезени. Поновно учитавање…',
    planTimerDataError: 'Тај фајл није важећи извоз плана и тајмера.',
    bodyDataLabel: 'Тело',
    bodyDataHint: 'Сачувај мерења тела, сачувану висину и старост као CSV фајл.',
    exportBodyDataLabel: 'Извези CSV тела',
    importBodyDataLabel: 'Увези CSV тела',
    bodyDataExportSuccess: 'CSV тела је извезен.',
    bodyDataSuccess: 'Подаци о телу су увезени. Поновно учитавање…',
    bodyDataError: 'Тај фајл није важећи CSV података о телу.',
    googleDriveLabel: 'Google Drive',
    googleDriveHint: 'Сачувај резервну копију свих података апликације у Pulse Trainer фасциклу на Google Drive-у.',
    googleDriveNotConfiguredHint: 'Google Drive извоз није подешен у овој верзији.',
    googleDriveExportLabel: 'Извези на Google Drive',
    googleDriveExportingLabel: 'Извоз у току…',
    googleDriveImportLabel: 'Увези са Google Drive-а',
    googleDriveImportComingSoon: 'Увоз захтева будуће Picker/API key подешавање и још није доступан.',
    googleDriveExportSuccess: 'Извезено на Google Drive.',
    googleDriveExportError: 'Google Drive извоз није успео. Покушај поново касније.',
    deleteDataLabel: 'Брисање података',
    clearBodyDataLabel: 'Обриши историју тела',
    clearBodyDataTitle: 'Обрисати податке о телу?',
    clearBodyDataConfirm: 'Ово брише историју телесних мерења, сачувану висину и старост са овог уређаја.',
    typeYesInstruction: 'Упиши YES за потврду.',
    deleteLabel: 'Обриши',
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
    completedLabel: 'Завршено',
    planTitle: 'План тренинга',
    planEmptyTextLabel: 'Још нема садржаја. Изаберите Уреди да додате детаље.',
    bodyTabLabel: 'Тело',
    bodyTitleLabel: 'Тело',
    workoutSectionLabel: 'Главни тренинг',
    warmupSectionLabel: 'Загревање',
    cardioSectionLabel: 'Кардио',
    cooldownSectionLabel: 'Хлађење',
    notesSectionLabel: 'Белешке',
    bodyMetricsSectionLabel: 'Телесна тежина',
    bodyMetricsCurrentLabel: 'Последњи унос',
    bodyMetricsStatsLabel: 'Статистика тела',
    bodyMetricsRecentLabel: 'Недавни уноси',
    bodyMetricsLoadMoreLabel: 'Учитај још',
    bodyMetricsChartLabel: 'Филтер',
    bodyMetricsGraphLabel: 'График телесних мерења',
    bodyMetricsAddLabel: 'Додај мерење',
    bodyMetricsChartHintLabel: 'Додирни тачку',
    bodyMetricsMonthNavigationLabel: 'Месец сидро',
    bodyMetricsPreviousMonthLabel: 'Претходни',
    bodyMetricsNextMonthLabel: 'Следећи',
    bodyMetricsEmptyLabel: 'Нема уноса.',
    bodyMetricsChartEmptyLabel: 'Нема података у опсегу.',
    bodyMetricsDateLabel: 'Датум',
    bodyMetricsDateHint: 'Данас. Снимање истог датума замењује тај дан.',
    bodyMetricsBodyFatLabel: 'Проценат масти',
    bodyMetricsBodyFatToggleLabel: 'Масти',
    bodyMetricsHeightLabel: 'Висина (см)',
    bodyMetricsAgeLabel: 'Године',
    bodyMetricsHeightHint: 'За BMI.',
    bodyMetricsBmiLabel: 'BMI',
    bodyMetricsSaveLabel: 'Сачувај',
    bodyMetricsUpdateLabel: 'Ажурирај',
    bodyMetricsRemoveLabel: 'Уклони',
    bodyMetricsRange1MonthLabel: 'Текући месец',
    bodyMetricsRange3MonthsLabel: '3M',
    bodyMetricsRange6MonthsLabel: '6M',
    bodyMetricsRange1YearLabel: '1Y',
    bodyMetricsRangeAllLabel: 'Све',
    notesInputLabel: 'Белешке за сесију',
    warmupInputLabel: 'Детаљи загревања',
    cooldownInputLabel: 'Детаљи хлађења',
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
    roundCounter: (current, total) => `Рунда ${current} / ${total}`,
  },
};
