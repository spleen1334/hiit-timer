import type { AppViewMode } from '../../plan/types';

type ModeTabsProps = {
  timerLabel: string;
  planLabel: string;
  value: AppViewMode;
  onChange: (next: AppViewMode) => void;
};

export function ModeTabs({ timerLabel, planLabel, value, onChange }: ModeTabsProps) {
  return (
    <nav className="mode-tabs" aria-label="App mode">
      <button
        type="button"
        className={`mode-tab ${value === 'timer' ? 'is-active' : ''}`}
        aria-pressed={value === 'timer'}
        onClick={() => onChange('timer')}
      >
        {timerLabel}
      </button>
      <button
        type="button"
        className={`mode-tab ${value === 'plan' ? 'is-active' : ''}`}
        aria-pressed={value === 'plan'}
        onClick={() => onChange('plan')}
      >
        {planLabel}
      </button>
    </nav>
  );
}
