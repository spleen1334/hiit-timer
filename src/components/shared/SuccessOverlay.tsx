import type { CSSProperties } from 'react';

const SUCCESS_RAYS = Array.from({ length: 10 }, (_, index) => index);
const SUCCESS_CONFETTI = Array.from({ length: 18 }, (_, index) => index);

export function SuccessOverlay({ onDismiss, returnLabel }: { onDismiss: () => void; returnLabel: string }) {
  return (
    <div className="success-overlay">
      <div className="success-wash" />
      <button type="button" className="success-stage" onClick={onDismiss} aria-label={returnLabel}>
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
