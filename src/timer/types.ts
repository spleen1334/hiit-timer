export type Phase = 'delay' | 'active' | 'rest' | 'complete';

export type SessionMode = 'setup' | 'running' | 'paused' | 'complete';

export type TimerSettings = {
  activeSeconds: number;
  restSeconds: number;
  rounds: number;
  initialDelay: number;
  soundEnabled: boolean;
};

export type HistoryEntry = {
  completedAt: string;
  totalSeconds: number;
  workSeconds: number;
  restSeconds: number;
  delaySeconds: number;
  settings: TimerSettings;
};

export type SessionTotals = {
  workSeconds: number;
  restSeconds: number;
  delaySeconds: number;
  totalSeconds: number;
};

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
