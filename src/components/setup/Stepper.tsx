import { clamp } from '../../timer/math';

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

export function Stepper({ label, value, min, max, step = 1, tint, unit, onChange }: StepperProps) {
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
