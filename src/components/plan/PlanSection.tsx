import type { ReactNode } from 'react';

export function PlanSection({
  id,
  title,
  icon,
  isOpen,
  expandLabel,
  collapseLabel,
  onToggle,
  className,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  expandLabel: string;
  collapseLabel: string;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`plan-section-card ${className ?? ''}`.trim()}>
      <button
        type="button"
        className="plan-section-head plan-section-toggle"
        onClick={onToggle}
        aria-label={`${title} · ${isOpen ? collapseLabel : expandLabel}`}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="plan-section-icon" aria-hidden="true">
          {icon}
        </span>
        <h2>{title}</h2>
        <span className={`plan-section-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={id}
        className={`plan-section-body ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="plan-section-inner">{children}</div>
      </div>
    </section>
  );
}
