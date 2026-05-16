export function AppMark({ label }: { label: string }) {
  return (
    <div className="app-mark" aria-label={label}>
      <span className="app-mark-chip app-mark-work" />
      <span className="app-mark-core">
        <svg viewBox="0 0 64 64" className="app-mark-icon" aria-hidden="true">
          <circle cx="32" cy="34" r="18" fill="none" stroke="currentColor" strokeWidth="5" />
          <path d="M32 18V34L42.5 40.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="app-mark-chip app-mark-rest" />
    </div>
  );
}
