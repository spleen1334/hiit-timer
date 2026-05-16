import type { ReactNode } from 'react';

type CollapsiblePanelProps = {
  id: string;
  isOpen: boolean;
  children: ReactNode;
};

export function CollapsiblePanel({ id, isOpen, children }: CollapsiblePanelProps) {
  return (
    <section id={id} className={`collapsible-panel ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="collapsible-inner">{children}</div>
    </section>
  );
}
