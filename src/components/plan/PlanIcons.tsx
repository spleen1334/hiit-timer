import type { BodyPartIcon } from '../../plan/types';

export function BodyPartBadge({ type }: { type: BodyPartIcon }) {
  const glyph = (() => {
    if (type === 'back') return <BackIcon />;
    if (type === 'legs') return <LegsIcon />;
    if (type === 'chest') return <ChestIcon />;
    if (type === 'shoulders') return <ShouldersIcon />;
    if (type === 'biceps') return <BicepsIcon />;
    if (type === 'triceps') return <TricepsIcon />;
    if (type === 'core') return <CoreIcon />;
    if (type === 'cardio') return <CardioBodyIcon />;
    return <FullBodyIcon />;
  })();

  return (
    <span className={`plan-icon-badge body-${type}`} aria-hidden="true">
      <svg viewBox="0 0 20 20" className="body-part-icon">
        {glyph}
      </svg>
    </span>
  );
}

export function NumberIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7.2H10.8V13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SetsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <rect x="2.5" y="8.5" width="4" height="3" rx="0.8" fill="currentColor" />
      <rect x="13.5" y="8.5" width="4" height="3" rx="0.8" fill="currentColor" />
      <rect x="6.5" y="9.2" width="7" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

export function RepsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M6 5.2V2.8L2.8 6L6 9.2V6.8H12.8C14.6 6.8 16 8.2 16 10C16 11.8 14.6 13.2 12.8 13.2H10.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14.8V17.2L17.2 14L14 10.8V13.2H7.2C5.4 13.2 4 11.8 4 10C4 8.2 5.4 6.8 7.2 6.8H9.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WeightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M6.2 8.2H13.8V11.8H6.2Z" fill="currentColor" />
      <rect x="2.3" y="7.2" width="3.6" height="5.6" rx="1" fill="currentColor" />
      <rect x="14.1" y="7.2" width="3.6" height="5.6" rx="1" fill="currentColor" />
      <rect x="8.2" y="5.1" width="3.6" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

export function RestIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <circle cx="10" cy="10.2" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 7.1V10.2L12.2 11.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function NotesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M4 3.4H16V16.6H4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.6 7.2H13.4M6.6 10.2H13.4M6.6 13.2H11.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WarmupIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M6.4 14.8C4.4 12.7 4.4 9.4 6.4 7.3L10 3.8L13.6 7.3C15.6 9.4 15.6 12.7 13.6 14.8C11.6 16.9 8.4 16.9 6.4 14.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 11.1H11.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CooldownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M10 3.3C6.6 3.3 3.8 6.1 3.8 9.5C3.8 13.1 6.6 15.9 10 15.9C13.4 15.9 16.2 13.1 16.2 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.4 2.8C13.9 3.4 15.1 4.6 15.7 6.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WorkoutIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <rect x="2.5" y="8.3" width="3.4" height="3.4" rx="0.8" fill="currentColor" />
      <rect x="14.1" y="8.3" width="3.4" height="3.4" rx="0.8" fill="currentColor" />
      <rect x="5.9" y="9.1" width="8.2" height="1.8" rx="0.9" fill="currentColor" />
      <rect x="8.6" y="5.1" width="2.8" height="1.4" rx="0.7" fill="currentColor" />
    </svg>
  );
}

export function CardioIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M3.5 12.6H6L8 8L11.2 15L13.2 10.8H16.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExerciseFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon plan-inline-icon" aria-hidden="true">
      <rect x="2.5" y="8.3" width="3.4" height="3.4" rx="0.8" fill="currentColor" />
      <rect x="14.1" y="8.3" width="3.4" height="3.4" rx="0.8" fill="currentColor" />
      <rect x="5.9" y="9.1" width="8.2" height="1.8" rx="0.9" fill="currentColor" />
    </svg>
  );
}

export function TimeFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon plan-inline-icon" aria-hidden="true">
      <circle cx="10" cy="10" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 7.2V10.2L12.1 11.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M11.6 2.8L12 4.3C12.4 4.4 12.8 4.6 13.1 4.8L14.5 4.1L15.9 5.5L15.2 6.9C15.4 7.2 15.6 7.6 15.7 8L17.2 8.4V10.4L15.7 10.8C15.6 11.2 15.4 11.6 15.2 11.9L15.9 13.3L14.5 14.7L13.1 14C12.8 14.2 12.4 14.4 12 14.5L11.6 16H9.6L9.2 14.5C8.8 14.4 8.4 14.2 8.1 14L6.7 14.7L5.3 13.3L6 11.9C5.8 11.6 5.6 11.2 5.5 10.8L4 10.4V8.4L5.5 8C5.6 7.6 5.8 7.2 6 6.9L5.3 5.5L6.7 4.1L8.1 4.8C8.4 4.6 8.8 4.4 9.2 4.3L9.6 2.8H11.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10.6" cy="9.4" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="plan-mini-icon" aria-hidden="true">
      <path d="M7.4 12.6L5.9 14.1C4.8 15.2 3 15.2 1.9 14.1C0.8 13 0.8 11.2 1.9 10.1L4.9 7.1C6 6 7.8 6 8.9 7.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12.6 7.4L14.1 5.9C15.2 4.8 17 4.8 18.1 5.9C19.2 7 19.2 8.8 18.1 9.9L15.1 12.9C14 14 12.2 14 11.1 12.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.6 12.4L12.4 7.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return <path d="M4.8 9.8C5.8 7.3 7.8 6 10 6C12.2 6 14.2 7.3 15.2 9.8M6.2 13.2C7 14.4 8.4 15.2 10 15.2C11.6 15.2 13 14.4 13.8 13.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />;
}

function LegsIcon() {
  return <path d="M8 5.3L7.1 10.6L8.8 14.8M12 5.3L12.9 10.6L11.2 14.8M6.8 10.6H13.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
}

function ChestIcon() {
  return <path d="M5.2 7.2L8.1 5.5L10 7L11.9 5.5L14.8 7.2V12.8L10 15.6L5.2 12.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />;
}

function ShouldersIcon() {
  return <path d="M5.2 9.5H14.8M7.1 9.5V5.8M12.9 9.5V5.8M5.2 12.8H14.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />;
}

function BicepsIcon() {
  return <path d="M6 12.8C7.4 14.6 10.3 14.9 12 13.4C13.1 12.4 13.5 10.9 13.1 9.5L11.3 7.3M6 12.8L4.8 10.5M11.3 7.3H14.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
}

function TricepsIcon() {
  return <path d="M6 6.4L10.1 10.5L14 6.6M10.1 10.5V14.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
}

function CoreIcon() {
  return <path d="M7.2 5.8H12.8M6.2 8.8H13.8M5.8 11.8H14.2M7.2 14.8H12.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />;
}

function FullBodyIcon() {
  return <path d="M10 4.9V15.1M6.8 8.3H13.2M7.3 15.1L10 11.7L12.7 15.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
}

function CardioBodyIcon() {
  return <path d="M4.2 11.7H6.3L7.7 8.4L10 13.6L11.7 10.4H15.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
}
