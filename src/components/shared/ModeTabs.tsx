import type { AppViewMode } from '../../app/types';
import { BodyIcon, PlanIcon, TimerStackIcon } from './icons';

type ModeTabsProps = {
  timerLabel: string;
  planLabel: string;
  bodyLabel: string;
  value: AppViewMode;
  onChange: (next: AppViewMode) => void;
};

const TAB_ITEMS = [
  { id: 'timer', label: 'timerLabel' as const, icon: <TimerStackIcon /> },
  { id: 'plan', label: 'planLabel' as const, icon: <PlanIcon /> },
  { id: 'body', label: 'bodyLabel' as const, icon: <BodyIcon /> },
] as const;

export function ModeTabs({ timerLabel, planLabel, bodyLabel, value, onChange }: ModeTabsProps) {
  const labels = { timerLabel, planLabel, bodyLabel };

  return (
    <nav className="mode-tabs" aria-label="App mode">
      {TAB_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mode-tab ${value === item.id ? 'is-active' : ''}`}
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
        >
          <span className="mode-tab-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="mode-tab-text">{labels[item.label]}</span>
        </button>
      ))}
    </nav>
  );
}
