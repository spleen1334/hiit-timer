import { PhoneRotateIcon } from './icons';

export function OrientationLock({ label }: { label: string }) {
  return (
    <div className="orientation-lock" role="status" aria-live="polite">
      <div className="orientation-lock-card">
        <PhoneRotateIcon />
        <p>{label}</p>
      </div>
    </div>
  );
}
